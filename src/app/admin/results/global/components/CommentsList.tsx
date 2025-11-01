import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Comment {
  user: string;
  manager: string;
  comment: string;
  mood: string;
}

interface CommentsListProps {
  comments: Comment[];
}

export function CommentsList({ comments }: CommentsListProps) {
  return (
    <Card className="flex flex-col bg-slate-900 border-slate-800 text-white">
      <CardHeader>
        <CardTitle>Derniers Commentaires</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[430px] pr-4">
          <div className="space-y-6">
            {comments.length === 0 ? (
              <p className="text-slate-400 text-center">
                Aucun commentaire pour cette sélection.
              </p>
            ) : (
              comments.map((item, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div
                    className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${
                      item.mood === "green"
                        ? "bg-green-500"
                        : item.mood === "blue"
                          ? "bg-sky-500"
                          : item.mood === "yellow"
                            ? "bg-orange-500"
                            : item.mood === "red"
                              ? "bg-red-500"
                              : ""
                    }`}
                  />
                  <div>
                    <p className="font-semibold text-slate-300">
                      {item.user}{" "}
                      <span className="text-xs font-normal text-slate-500">
                        (Équipe {item.manager})
                      </span>
                    </p>
                    <p className="text-sm text-slate-400">{item.comment}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
