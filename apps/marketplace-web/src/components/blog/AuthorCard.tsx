import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AuthorCardProps {
  author: { name: string; avatar?: { url?: string } | null; bio?: string };
}

export function AuthorCard({ author }: AuthorCardProps) {
  const initials = author.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
      <Avatar className="h-16 w-16">
        <AvatarImage src={author.avatar?.url} alt={author.name} />
        <AvatarFallback className="text-lg">{initials}</AvatarFallback>
      </Avatar>
      <div>
        <p className="font-semibold text-foreground">{author.name}</p>
        {author.bio && <p className="text-sm text-muted-foreground line-clamp-2">{author.bio}</p>}
      </div>
    </div>
  );
}
