import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, Search, BookOpen, Zap, Users, Lock, Database } from "lucide-react";

interface HelpArticle {
  id: string;
  title: string;
  category: string;
  icon: React.ReactNode;
  content: string;
  keywords: string[];
}

const helpArticles: HelpArticle[] = [
  {
    id: "getting-started",
    title: "Getting Started with Evalia",
    category: "Getting Started",
    icon: <BookOpen className="w-5 h-5" />,
    keywords: ["start", "new", "first", "begin", "setup"],
    content: `
## Getting Started

Welcome to Evalia! Follow these steps to create your first survey:

1. **Click "New Survey"** on your Dashboard
2. **Choose a creation method:**
   - **Template**: Start with pre-built survey templates
   - **AI**: Generate questions using natural language (e.g., "Create a 10-question engagement survey")
   - **Upload**: Import questions from a PDF, Word, or text file
3. **Edit questions** to customize them for your needs
4. **Add welcome and thank you messages** to personalize the experience
5. **Publish** when ready to collect responses

Each survey gets a unique shareable link for respondents to complete.
    `,
  },
  {
    id: "ai-generation",
    title: "Using AI to Generate Surveys",
    category: "Survey Creation",
    icon: <Zap className="w-5 h-5" />,
    keywords: ["ai", "generate", "artificial intelligence", "smart", "auto"],
    content: `
## AI-Powered Survey Generation

Evalia uses advanced AI to quickly create professional surveys from simple descriptions.

### How to Use AI Generation:
1. Click "New Survey" → Select **AI** option
2. Describe what you need: "Create a compliance training assessment for new employees"
3. Review generated questions and edit as needed
4. AI will create properly structured questions with relevant options

### Best Practices:
- Be specific: "5-question product feedback survey" works better than just "survey"
- Describe your audience: "Survey for managers about team communication"
- Mention the goal: "Assess understanding of safety protocols"

### Tips:
- AI respects your domain (training, feedback, assessment, etc.)
- You can refine suggestions through the AI chat interface
- Edit any generated question manually afterward
    `,
  },
  {
    id: "respondent-management",
    title: "Managing Respondents & Invitations",
    category: "Respondent Management",
    icon: <Users className="w-5 h-5" />,
    keywords: ["respondent", "invite", "email", "csv", "import", "tracking"],
    content: `
## Respondent Management

Evalia allows you to track and invite respondents while protecting their privacy.

### Inviting Respondents:
1. Open your survey → Click menu (⋮) → **Manage Respondents**
2. Click **Import Respondents**
3. Upload a CSV or Excel file with columns:
   - **email** (required) - respondent's email
   - **name** (optional) - respondent's name

### CSV Format:
\`\`\`
email,name
john@company.com,John Smith
jane@company.com,Jane Doe
\`\`\`

Or for Excel: just create columns named "Email" and "Name"

### Respondent Tracking:
- **Pending**: Invited but hasn't submitted
- **Submitted**: Has completed the survey
- See invitation dates and respondent tokens

### Data Privacy:
✓ Emails are used ONLY for sending invitations
✓ Emails are NOT stored in your database
✓ Respondents tracked by unique tokens only
✓ You can delete respondents anytime
    `,
  },
  {
    id: "survey-types",
    title: "Question Types & Advanced Features",
    category: "Survey Creation",
    icon: <Database className="w-5 h-5" />,
    keywords: ["question", "type", "rating", "matrix", "ranking", "nps", "date"],
    content: `
## Survey Question Types

Evalia supports 11 question types for comprehensive assessments:

### Basic Types:
- **Text**: Single-line text responses
- **Textarea**: Multi-line text responses
- **Email**: Email validation included
- **Number**: Numeric input

### Selection Types:
- **Multiple Choice**: Select one option
- **Checkbox**: Select multiple options

### Rating Types:
- **Rating Scale**: 1-5 or 1-10 scale
- **NPS (Net Promoter Score)**: 0-10 likelihood scale

### Advanced Types:
- **Matrix/Grid**: Assess multiple skills/attributes in one question
- **Ranking**: Respondents rank items in order of preference
- **Date Picker**: Collect dates (useful for scheduling, certifications)

### Skip Logic (Conditional Questions):
Show/hide questions based on previous answers. Example:
- Question 1: "Have you completed training?" 
- Question 2: "When?" (only shows if Q1 = "Yes")

### Question Randomization:
Shuffle question order automatically to prevent bias or pattern recognition in compliance training.
    `,
  },
  {
    id: "analytics",
    title: "Viewing Analytics & Responses",
    category: "Analytics",
    icon: <Zap className="w-5 h-5" />,
    keywords: ["analytics", "data", "results", "response", "chart", "export"],
    content: `
## Analytics & Response Management

### Viewing Results:
1. Open your survey → Click **Analyze** button
2. See real-time response metrics:
   - Total responses
   - Completion rate
   - Average time to complete
   - Response timeline

### Searching Responses:
- Use the search box to find specific responses by keywords
- Useful for finding feedback about particular topics

### Bulk Actions:
- Select multiple responses
- Delete duplicates
- Duplicate detection helps identify suspicious patterns

### Exporting Data:
- Export all responses as CSV/JSON
- Great for further analysis in Excel or other tools
- Maintains respondent privacy (tokens instead of emails)

### Filtering:
- Filter by date range
- Filter by completion status
- Filter by response pattern
    `,
  },
  {
    id: "data-privacy",
    title: "Data Privacy & Security",
    category: "Security",
    icon: <Lock className="w-5 h-5" />,
    keywords: ["privacy", "security", "data", "compliance", "gdpr", "protection"],
    content: `
## Data Privacy & Security

Evalia is built with privacy as a first principle for employee training.

### How We Protect Your Data:
✓ **Encrypted connection** (HTTPS) for all communications
✓ **Secure authentication** with password hashing
✓ **Session management** with automatic timeouts
✓ **No third-party tracking** of respondent data
✓ **Minimal data storage** - only what's necessary

### Respondent Privacy:
✓ Email addresses NOT permanently stored
✓ Responses tracked by unique tokens only
✓ No identifying information required (anonymous mode available)
✓ You control data retention and deletion

### For Compliance Training:
- Collect respondent identities only if needed for certification
- Use anonymous mode for sensitive feedback
- Export data securely for compliance records
- Delete data after required retention period

### Your Responsibilities:
- Keep your account password secure
- Comply with local data regulations (GDPR, CCPA, etc.)
- Inform respondents how their data will be used
- Manage data deletion according to your policy
    `,
  },
];

export default function HelpPage() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(helpArticles.map(a => a.category)));

  const filteredArticles = helpArticles.filter(article => {
    const matchesSearch = searchTerm === "" || 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.keywords.some(k => k.includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === null || article.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold" data-testid="heading-help">Help & Documentation</h1>
              <p className="text-muted-foreground mt-1">Learn how to use Evalia for employee training surveys</p>
            </div>
            <Button variant="outline" onClick={() => setLocation("/account")} data-testid="button-back">
              Back to Account
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search help articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-help"
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {searchTerm === "" && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3">Browse by Category</h2>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                onClick={() => setSelectedCategory(null)}
                data-testid="button-category-all"
              >
                All Articles
              </Button>
              {categories.map(cat => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  onClick={() => setSelectedCategory(cat)}
                  data-testid={`button-category-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Articles Grid */}
        {filteredArticles.length === 0 ? (
          <div className="text-center py-12" data-testid="text-no-results">
            <p className="text-muted-foreground mb-4">No articles found matching your search.</p>
            <Button variant="outline" onClick={() => setSearchTerm("")} data-testid="button-clear-search">
              Clear Search
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredArticles.map(article => (
              <Card key={article.id} className="hover-elevate cursor-pointer" data-testid={`card-article-${article.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-primary mt-1">
                        {article.icon}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{article.title}</CardTitle>
                        <CardDescription>{article.category}</CardDescription>
                      </div>
                    </div>
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose dark:prose-invert max-w-none text-sm">
                    {article.content.split('\n').map((line, i) => {
                      if (line.startsWith('##')) {
                        return <h3 key={i} className="font-semibold mt-4 mb-2">{line.replace('##', '').trim()}</h3>;
                      }
                      if (line.startsWith('###')) {
                        return <h4 key={i} className="font-medium mt-3 mb-2">{line.replace('###', '').trim()}</h4>;
                      }
                      if (line.startsWith('-')) {
                        return <li key={i} className="ml-4">{line.replace('-', '').trim()}</li>;
                      }
                      if (line.startsWith('✓')) {
                        return <div key={i} className="text-green-600 dark:text-green-400">{line}</div>;
                      }
                      if (line.trim() === '') {
                        return <div key={i} className="h-2" />;
                      }
                      return <p key={i} className="text-sm">{line}</p>;
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
