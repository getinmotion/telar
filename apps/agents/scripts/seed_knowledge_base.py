"""
Script to seed the RAG knowledge base from local markdown/text files.

Usage:
    cd apps/agents
    python scripts/seed_knowledge_base.py
    python scripts/seed_knowledge_base.py --category legal
    python scripts/seed_knowledge_base.py --dir knowledge_base/legal --category legal
    python scripts/seed_knowledge_base.py --file knowledge_base/legal/registro.md

Each file can have optional YAML frontmatter to specify knowledge_category:
    ---
    knowledge_category: legal
    tags: [registro, formalización]
    ---
    # Document content here...

If no frontmatter is present, the parent folder name is used as the category.
"""

import asyncio
import argparse
import sys
import os
from pathlib import Path

# Ensure project root is in path
project_root = Path(__file__).parent.parent.parent  # apps/
sys.path.insert(0, str(project_root))

from dotenv import load_dotenv
load_dotenv(Path(__file__).parent.parent / ".env")

import frontmatter  # python-frontmatter


async def seed_file(filepath: Path, default_category: str, uploaded_by: str = "seed_script") -> dict:
    """Process a single file and upload to RAG knowledge base."""
    # Import here to ensure env vars are loaded first
    from agents.core.state import KnowledgeDocument
    from agents.tools.vector_search import rag_service

    try:
        post = frontmatter.load(str(filepath))
        content = post.content.strip()
        category = post.metadata.get("knowledge_category", default_category)
    except Exception:
        # No frontmatter — treat entire file as content
        content = filepath.read_text(encoding="utf-8").strip()
        category = default_category

    if not content:
        return {"file": str(filepath), "status": "skipped", "reason": "empty content"}

    document = KnowledgeDocument(
        filename=filepath.name,
        file_type="text/markdown",
        content=content,
        knowledge_category=category,
        uploaded_by=uploaded_by,
    )

    doc_id = await rag_service.process_document(document)
    return {"file": str(filepath), "status": "ok", "document_id": str(doc_id), "category": category}


async def seed_directory(directory: Path, category: str) -> list[dict]:
    """Process all .md and .txt files in a directory."""
    results = []
    files = list(directory.glob("*.md")) + list(directory.glob("*.txt"))

    if not files:
        print(f"  [SKIP] No .md or .txt files found in {directory}")
        return results

    for filepath in sorted(files):
        print(f"  Processing: {filepath.name} (category={category}) ...", end=" ")
        result = await seed_file(filepath, default_category=category)
        status = result.get("status", "?")
        print(status.upper())
        results.append(result)

    return results


async def main(args: argparse.Namespace) -> None:
    knowledge_base_root = Path(__file__).parent.parent / "knowledge_base"

    all_results = []

    if args.file:
        # Single file mode
        filepath = Path(args.file)
        if not filepath.exists():
            print(f"ERROR: File not found: {filepath}")
            sys.exit(1)
        category = args.category or filepath.parent.name
        print(f"Seeding single file: {filepath} (category={category})")
        result = await seed_file(filepath, default_category=category)
        all_results.append(result)

    elif args.dir:
        # Single directory mode
        directory = Path(args.dir)
        if not directory.exists():
            print(f"ERROR: Directory not found: {directory}")
            sys.exit(1)
        category = args.category or directory.name
        print(f"Seeding directory: {directory} (category={category})")
        results = await seed_directory(directory, category)
        all_results.extend(results)

    elif args.category:
        # Specific category from knowledge_base/<category>/
        category_dir = knowledge_base_root / args.category
        if not category_dir.exists():
            print(f"ERROR: Category directory not found: {category_dir}")
            sys.exit(1)
        print(f"\nSeeding category: {args.category}")
        results = await seed_directory(category_dir, args.category)
        all_results.extend(results)

    else:
        # Seed all categories
        categories = [d.name for d in knowledge_base_root.iterdir() if d.is_dir()]
        if not categories:
            print(f"No category directories found in {knowledge_base_root}")
            sys.exit(0)

        for category in sorted(categories):
            print(f"\nSeeding category: {category}")
            category_dir = knowledge_base_root / category
            results = await seed_directory(category_dir, category)
            all_results.extend(results)

    # Summary
    ok = sum(1 for r in all_results if r.get("status") == "ok")
    skipped = sum(1 for r in all_results if r.get("status") == "skipped")
    failed = sum(1 for r in all_results if r.get("status") == "error")

    print(f"\n{'='*50}")
    print(f"Seeding complete: {ok} indexed, {skipped} skipped, {failed} failed")
    if failed:
        for r in all_results:
            if r.get("status") == "error":
                print(f"  FAILED: {r['file']} — {r.get('error', '?')}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed RAG knowledge base from local files")
    parser.add_argument("--file", help="Path to a single file to index")
    parser.add_argument("--dir", help="Path to a directory to index")
    parser.add_argument("--category", help="Knowledge category (legal, faq, pricing, etc.)")
    parser.add_argument("--uploaded-by", default="seed_script", help="Uploader identifier")
    args = parser.parse_args()

    asyncio.run(main(args))
