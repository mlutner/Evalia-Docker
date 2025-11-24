import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Check, Clock, Upload, AlertCircle, Info, Users } from "lucide-react";
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
  const [textInput, setTextInput] = useState("");

  const { data: respondents = [], isLoading, refetch } = useQuery<SurveyRespondent[]>({
    queryKey: [`/api/surveys/${surveyId}/respondents`],
  });

  const parseCsvFile = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: any) => {
        const rows = results.data;
        
        const emailCol = Object.keys(rows[0] || {}).find(k => 
          k.toLowerCase().includes("email") || k.toLowerCase().includes("e-mail") || k.toLowerCase() === "email address"
        );
        
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

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseCsvFile(file);
  };

  const parsePdfFile = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfParseModule = await import("pdf-parse");
      const pdfParse = (pdfParseModule as any).default || pdfParseModule;
      const data = await pdfParse(arrayBuffer);
      const text = data.text;

      // Extract emails from PDF text using regex
      const emailRegex = /([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
      const emails = text.match(emailRegex) || [];

      if (emails.length === 0) {
        toast({
          title: "No emails found",
          description: "PDF doesn't contain any email addresses",
          variant: "destructive",
        });
        return;
      }

      const uniqueEmails = Array.from(new Set(emails));
      const parsed = uniqueEmails.map(email => ({
        email: email.trim(),
        name: undefined,
      }));

      setCsvData(parsed);
      setPreview(`Found ${parsed.length} unique email${parsed.length !== 1 ? 's' : ''} in PDF`);
    } catch (error: any) {
      toast({
        title: "Error parsing PDF",
        description: error.message || "Failed to extract emails from PDF",
        variant: "destructive",
      });
    }
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      parsePdfFile(file);
    }
  };

  const parseTextInput = (text: string) => {
    if (!text.trim()) {
      toast({
        title: "Empty input",
        description: "Please paste some data",
        variant: "destructive",
      });
      return;
    }

    const lines = text.trim().split('\n').filter(line => line.trim());
    const parsed: Array<{ email: string; name?: string }> = [];

    lines.forEach(line => {
      // Format: email@example.com | Name or email@example.com
      if (line.includes('|')) {
        const [email, name] = line.split('|').map(s => s.trim());
        if (email && email.includes('@')) {
          parsed.push({ email, name: name || undefined });
        }
      }
      // Format: Name <email@example.com>
      else if (line.includes('<') && line.includes('>')) {
        const match = line.match(/(.+?)\s*<(.+?)>/);
        if (match) {
          const [, name, email] = match;
          parsed.push({ email: email.trim(), name: name.trim() });
        }
      }
      // Format: just email
      else if (line.includes('@')) {
        parsed.push({ email: line.trim() });
      }
    });

    if (parsed.length === 0) {
      toast({
        title: "No emails found",
        description: "Please use format: email@example.com | Name or email@example.com",
        variant: "destructive",
      });
      return;
    }

    setCsvData(parsed);
    setPreview(`Ready to invite ${parsed.length} respondent${parsed.length !== 1 ? 's' : ''}`);
    setTextInput("");
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

  const completedCount = respondents.filter(r => r.submittedAt).length;
  const completionRate = respondents.length > 0 ? Math.round((completedCount / respondents.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold" data-testid="heading-respondents">Respondent Tracking</h1>
            <p className="text-muted-foreground mt-2">Manage survey invitations and track who's submitted responses</p>
          </div>
          <Button onClick={() => setLocation(`/builder/${surveyId}`)} variant="outline" data-testid="button-back">
            Back to Survey
          </Button>
        </div>

        {respondents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Invited</CardTitle>
                <Users className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{respondents.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <Check className="w-4 h-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{completedCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <Clock className="w-4 h-4 text-primary-teal" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary-teal">{completionRate}%</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Privacy Notice */}
        <Card className="border-border bg-secondary dark:bg-secondary">
          <CardContent className="pt-6 flex gap-3">
            <Info className="w-5 h-5 text-primary-teal dark:text-icon-teal flex-shrink-0 mt-0.5" />
            <div className="text-sm text-neutral-text-primary dark:text-neutral-surface">
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
                Choose how to import: CSV/Excel file, PDF, or paste text
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="csv" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="csv">CSV/Excel</TabsTrigger>
                <TabsTrigger value="pdf">PDF</TabsTrigger>
                <TabsTrigger value="text">Text/Paste</TabsTrigger>
              </TabsList>

              {/* CSV Tab */}
              <TabsContent value="csv" className="space-y-4">
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
                    onChange={handleCsvUpload}
                    className="hidden"
                    data-testid="input-csv-file"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Format: Must contain "email" column (required), "name" column (optional)
                </p>
              </TabsContent>

              {/* PDF Tab */}
              <TabsContent value="pdf" className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer"
                     onClick={() => document.getElementById("pdf-upload")?.click()}
                     data-testid="dropzone-pdf">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="font-medium mb-1">Click to upload or drag PDF file</p>
                  <p className="text-sm text-muted-foreground">PDF with email addresses</p>
                  <input
                    id="pdf-upload"
                    type="file"
                    accept=".pdf"
                    onChange={handlePdfUpload}
                    className="hidden"
                    data-testid="input-pdf-file"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  We'll extract all email addresses found in the PDF automatically
                </p>
              </TabsContent>

              {/* Text/Paste Tab */}
              <TabsContent value="text" className="space-y-4">
                <Textarea
                  placeholder="Paste your respondent list here. Supported formats:&#10;1. One email per line: john@example.com&#10;2. With names: john@example.com | John Smith&#10;3. Email with name: John Smith <john@example.com>"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  className="min-h-40 font-mono text-sm"
                  data-testid="textarea-paste-respondents"
                />
                <Button
                  variant="outline"
                  onClick={() => parseTextInput(textInput)}
                  className="w-full"
                  data-testid="button-parse-text"
                >
                  Parse Text
                </Button>
                <div className="text-xs text-muted-foreground space-y-2">
                  <p><strong>Supported formats:</strong></p>
                  <p className="font-mono">john@example.com</p>
                  <p className="font-mono">john@example.com | John Smith</p>
                  <p className="font-mono">John Smith &lt;john@example.com&gt;</p>
                </div>
              </TabsContent>
            </Tabs>

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
                        <Badge variant="outline" className="bg-secondary text-primary-teal border-border gap-1" data-testid={`badge-pending-${r.id}`}>
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
