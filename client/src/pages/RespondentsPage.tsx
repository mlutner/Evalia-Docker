import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Trash2, Check, Clock, Upload, AlertCircle, Info } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { SurveyRespondent } from "@shared/schema";
import Papa from "papaparse";

export default function RespondentsPage() {
  const { surveyId } = useParams<{ surveyId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [csvData, setCsvData] = useState<Array<{ email: string; name?: string }>>([]);
  const [preview, setPreview] = useState<string>("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: respondents = [], isLoading, refetch } = useQuery<SurveyRespondent[]>({
    queryKey: [`/api/surveys/${surveyId}/respondents`],
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Support CSV, TSV, and Excel files
    const isExcel = file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || 
                    file.type === "application/vnd.ms-excel";

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: any) => {
        const rows = results.data;
        
        // Try to detect email column (supports: email, Email, e-mail, E-mail)
        const emailCol = Object.keys(rows[0] || {}).find(k => 
          k.toLowerCase().includes("email") || k.toLowerCase().includes("e-mail") || k.toLowerCase() === "email address"
        );
        
        // Try to detect name column (supports: name, Name, first_name, First Name, full_name, etc.)
        const nameCol = Object.keys(rows[0] || {}).find(k => 
          k.toLowerCase().includes("name") || k.toLowerCase().includes("first")
        );

        if (!emailCol) {
          toast({
            title: "Error",
            description: "CSV must contain an 'email' column",
            variant: "destructive",
          });
          return;
        }

        const parsed = rows.map((row: any) => ({
          email: row[emailCol]?.trim(),
          name: nameCol ? row[nameCol]?.trim() : undefined,
        })).filter((r: any) => r.email);

        setCsvData(parsed);
        setPreview(`Ready to invite ${parsed.length} respondent${parsed.length !== 1 ? 's' : ''}`);
      },
      error: (error: any) => {
        toast({
          title: "Error parsing file",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  const inviteMutation = useMutation({
    mutationFn: async () => {
      if (csvData.length === 0) {
        throw new Error("No respondents to invite");
      }

      return apiRequest("POST", `/api/surveys/${surveyId}/invite`, {
        respondents: csvData,
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Success",
        description: `Invited ${data.invited} respondent${data.invited !== 1 ? "s" : ""}`,
      });
      setCsvData([]);
      setPreview("");
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

        {/* Privacy Notice */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
          <CardContent className="pt-6 flex gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Privacy Protected:</strong> Emails are used only for sending invitations and are not stored in your database. Respondents are tracked by unique tokens only.
            </div>
          </CardContent>
        </Card>

        {/* Import Dialog */}
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger asChild>
            <Button className="w-full gap-2" data-testid="button-invite-respondents">
              <Plus className="w-4 h-4" />
              Import Respondents
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Import Respondents</DialogTitle>
              <DialogDescription>
                Upload a CSV or Excel file with columns: email (required), name (optional)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* File Upload */}
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer"
                   onClick={() => document.getElementById("csv-upload")?.click()}
                   data-testid="dropzone-csv">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="font-medium mb-1">Click to upload or drag CSV/Excel file</p>
                <p className="text-sm text-muted-foreground">Supported: CSV, TSV, XLS, XLSX</p>
                <input
                  id="csv-upload"
                  type="file"
                  accept=".csv,.tsv,.xls,.xlsx"
                  onChange={handleFileUpload}
                  className="hidden"
                  data-testid="input-csv-file"
                />
              </div>

              {/* Preview */}
              {preview && (
                <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 rounded-lg text-sm text-green-900 dark:text-green-100" data-testid="text-csv-preview">
                  ✓ {preview}
                </div>
              )}

              {csvData.length > 0 && (
                <div className="max-h-40 overflow-y-auto border rounded-lg p-3 bg-muted/50">
                  <p className="text-sm font-medium mb-2">Preview ({csvData.length} rows):</p>
                  {csvData.slice(0, 5).map((row, i) => (
                    <div key={i} className="text-sm text-muted-foreground truncate" data-testid={`row-preview-${i}`}>
                      {row.name ? `${row.name} (${row.email})` : row.email}
                    </div>
                  ))}
                  {csvData.length > 5 && (
                    <div className="text-sm text-muted-foreground">... and {csvData.length - 5} more</div>
                  )}
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setInviteOpen(false)} data-testid="button-cancel">
                  Cancel
                </Button>
                <Button
                  onClick={() => inviteMutation.mutate()}
                  disabled={inviteMutation.isPending || csvData.length === 0}
                  data-testid="button-send-invites"
                >
                  {inviteMutation.isPending ? "Sending..." : `Send Invites (${csvData.length})`}
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
                No respondents yet. Click "Import Respondents" to get started.
              </div>
            ) : (
              <div className="space-y-2">
                {respondents.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-3 border rounded-lg hover-elevate" data-testid={`row-respondent-${r.id}`}>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm" data-testid={`text-name-${r.id}`}>
                        {r.name || "Anonymous Respondent"}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono" data-testid={`text-token-${r.id}`}>
                        Token: {r.respondentToken?.slice(0, 8)}...
                      </p>
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
                              Remove {r.name || "this respondent"} from this survey? This cannot be undone.
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
