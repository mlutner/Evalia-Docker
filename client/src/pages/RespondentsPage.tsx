import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Trash2, Mail, Check, Clock } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { SurveyRespondent } from "@shared/schema";

export default function RespondentsPage() {
  const { surveyId } = useParams<{ surveyId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [emailsText, setEmailsText] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: respondents = [], isLoading, refetch } = useQuery<SurveyRespondent[]>({
    queryKey: [`/api/surveys/${surveyId}/respondents`],
  });

  const inviteMutation = useMutation({
    mutationFn: async () => {
      const lines = emailsText
        .split("\n")
        .map(line => line.trim())
        .filter(line => line);

      const respondentsList = lines.map(line => {
        const [email, name] = line.split("|").map(s => s.trim());
        return { email, name: name || email.split("@")[0] };
      });

      return apiRequest("POST", `/api/surveys/${surveyId}/invite`, {
        respondents: respondentsList,
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Success",
        description: `Invited ${data.invited} respondent${data.invited !== 1 ? "s" : ""}`,
      });
      setEmailsText("");
      setInviteOpen(false);
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to invite respondents",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/surveys/${surveyId}/respondents/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Removed",
        description: "Respondent has been removed",
      });
      setDeleteId(null);
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove respondent",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" data-testid="heading-respondents">Respondent Tracking</h1>
            <p className="text-muted-foreground mt-2">Manage survey invitations and track who's submitted responses</p>
          </div>
          <Button onClick={() => setLocation(`/builder/${surveyId}`)} variant="outline" data-testid="button-back">
            Back to Survey
          </Button>
        </div>

        {/* Invite Dialog */}
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger asChild>
            <Button className="w-full gap-2" data-testid="button-invite-respondents">
              <Plus className="w-4 h-4" />
              Invite Respondents
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Respondents</DialogTitle>
              <DialogDescription>
                Paste email addresses, one per line. Optionally add names separated by | (email | name)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="john@example.com | John Smith&#10;jane@example.com | Jane Doe&#10;bob@example.com"
                value={emailsText}
                onChange={(e) => setEmailsText(e.target.value)}
                className="min-h-40"
                data-testid="textarea-emails"
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setInviteOpen(false)} data-testid="button-cancel">
                  Cancel
                </Button>
                <Button
                  onClick={() => inviteMutation.mutate()}
                  disabled={inviteMutation.isPending || !emailsText.trim()}
                  data-testid="button-send-invites"
                >
                  {inviteMutation.isPending ? "Sending..." : "Send Invites"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Respondents List */}
        <Card data-testid="card-respondents">
          <CardHeader>
            <CardTitle>Respondents ({respondents.length})</CardTitle>
            <CardDescription>Track invitations and response status</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground" data-testid="text-loading">
                Loading respondents...
              </div>
            ) : respondents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground" data-testid="text-empty">
                No respondents yet. Click "Invite Respondents" to get started.
              </div>
            ) : (
              <div className="space-y-2">
                {respondents.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-3 border rounded-lg hover-elevate" data-testid={`row-respondent-${r.id}`}>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate" data-testid={`text-email-${r.id}`}>
                        {r.email || "Anonymous"}
                      </p>
                      {r.name && <p className="text-xs text-muted-foreground">{r.name}</p>}
                      <p className="text-xs text-muted-foreground mt-1" data-testid={`text-invited-${r.id}`}>
                        Invited: {r.invitedAt ? new Date(r.invitedAt).toLocaleDateString() : "-"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {r.submittedAt ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1" data-testid={`badge-submitted-${r.id}`}>
                          <Check className="w-3 h-3" />
                          Submitted
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1" data-testid={`badge-pending-${r.id}`}>
                          <Clock className="w-3 h-3" />
                          Pending
                        </Badge>
                      )}
                      <AlertDialog open={deleteId === r.id} onOpenChange={(open) => !open && setDeleteId(null)}>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setDeleteId(r.id)}
                          data-testid={`button-delete-${r.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Respondent</AlertDialogTitle>
                            <AlertDialogDescription>
                              Remove {r.email} from this survey? This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMutation.mutate(r.id)}
                              disabled={deleteMutation.isPending}
                              data-testid="button-confirm-delete"
                            >
                              {deleteMutation.isPending ? "Removing..." : "Remove"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
