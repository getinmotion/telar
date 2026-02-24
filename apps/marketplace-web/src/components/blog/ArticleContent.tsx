import { AuthorCard } from "@/components/blog/AuthorCard";
import { StoryblokRichText } from "@/components/StoryblokRichText";

interface ArticleContentProps {
  content: any;
  author?: { name: string; avatar?: { url?: string } | null; bio?: string };
}

export function ArticleContent({ content, author }: ArticleContentProps) {
  return (
    <div className="space-y-6">
      {author && <AuthorCard author={author} />}
      <StoryblokRichText content={content} />
    </div>
  );
}
