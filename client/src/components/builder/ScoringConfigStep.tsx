import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2 } from "lucide-react";
import type { SurveyScoreConfig, Question } from "@shared/schema";

interface ScoringConfigStepProps {
  questions: Question[];
  scoreConfig: SurveyScoreConfig | undefined;
  onScoreConfigChange: (config: SurveyScoreConfig) => void;
}

export default function ScoringConfigStep({
  questions,
  scoreConfig,
  onScoreConfigChange,
}: ScoringConfigStepProps) {
  const [isEnabled, setIsEnabled] = useState(scoreConfig?.enabled || false);
  const [categories, setCategories] = useState(scoreConfig?.categories || []);
  const [scoreRanges, setScoreRanges] = useState(scoreConfig?.scoreRanges || []);
  const [resultsSummary, setResultsSummary] = useState(scoreConfig?.resultsSummary || "");
  const [newCategoryName, setNewCategoryName] = useState("");

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory = {
        id: `cat-${Date.now()}`,
        name: newCategoryName.trim(),
      };
      setCategories([...categories, newCategory]);
      setNewCategoryName("");
    }
  };

  const handleRemoveCategory = (catId: string) => {
    setCategories(categories.filter((c) => c.id !== catId));
    setScoreRanges(scoreRanges.filter((r) => r.category !== catId));
  };

  const handleAddScoreRange = () => {
    if (categories.length === 0) return;
    const newRange = {
      category: categories[0].id,
      label: "",
      minScore: 0,
      maxScore: 5,
      interpretation: "",
    };
    setScoreRanges([...scoreRanges, newRange]);
  };

  const handleUpdateScoreRange = (
    index: number,
    field: string,
    value: any
  ) => {
    const updated = [...scoreRanges];
    updated[index] = { ...updated[index], [field]: value };
    setScoreRanges(updated);
  };

  const handleRemoveScoreRange = (index: number) => {
    setScoreRanges(scoreRanges.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const config: SurveyScoreConfig = {
      enabled: isEnabled,
      categories,
      scoreRanges,
      resultsSummary: resultsSummary || undefined,
    };
    onScoreConfigChange(config);
  };

  const categoriesByQuestion = questions.reduce(
    (acc, q) => {
      if (q.scoringCategory) {
        if (!acc[q.scoringCategory]) {
          acc[q.scoringCategory] = 0;
        }
        acc[q.scoringCategory]++;
      }
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-semibold mb-3">Assessment Scoring (Optional)</h2>
        <p className="text-muted-foreground text-lg">
          Enable scoring to automatically calculate results based on question categories
        </p>
      </div>

      {/* Enable Scoring Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Enable Scoring</CardTitle>
          <CardDescription>
            Turn on assessment scoring to show respondents their results and interpretations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Switch
              checked={isEnabled}
              onCheckedChange={(checked) => {
                setIsEnabled(checked);
                if (!checked) {
                  onScoreConfigChange({
                    enabled: false,
                    categories: [],
                    scoreRanges: [],
                  });
                }
              }}
              data-testid="switch-enable-scoring"
            />
            <Label className="cursor-pointer">
              {isEnabled ? "Scoring Enabled" : "Scoring Disabled"}
            </Label>
          </div>
        </CardContent>
      </Card>

      {isEnabled && (
        <>
          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Scoring Categories</CardTitle>
              <CardDescription>
                Define the categories that questions belong to (e.g., Autocratic, Democratic, etc.)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCategory();
                    }
                  }}
                  placeholder="e.g., Autocratic Leadership"
                  data-testid="input-category-name"
                />
                <Button
                  type="button"
                  onClick={handleAddCategory}
                  data-testid="button-add-category"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>

              {categories.length > 0 && (
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      data-testid={`category-${cat.id}`}
                    >
                      <div>
                        <p className="font-medium">{cat.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {categoriesByQuestion[cat.id] || 0} questions assigned
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveCategory(cat.id)}
                        data-testid={`button-remove-category-${cat.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Score Ranges */}
          {categories.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Score Ranges & Interpretations</CardTitle>
                <CardDescription>
                  Define what score ranges mean for each category
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {scoreRanges.map((range, idx) => (
                  <div key={idx} className="p-4 border rounded-lg space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm">Category</Label>
                        <select
                          value={range.category}
                          onChange={(e) =>
                            handleUpdateScoreRange(idx, "category", e.target.value)
                          }
                          className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                          data-testid={`select-score-category-${idx}`}
                        >
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label className="text-sm">Label (e.g., Strong Preference)</Label>
                        <Input
                          value={range.label}
                          onChange={(e) =>
                            handleUpdateScoreRange(idx, "label", e.target.value)
                          }
                          placeholder="e.g., Strong Preference"
                          className="mt-1"
                          data-testid={`input-score-label-${idx}`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm">Min Score</Label>
                        <Input
                          type="number"
                          value={range.minScore}
                          onChange={(e) =>
                            handleUpdateScoreRange(
                              idx,
                              "minScore",
                              parseInt(e.target.value, 10)
                            )
                          }
                          className="mt-1"
                          data-testid={`input-min-score-${idx}`}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Max Score</Label>
                        <Input
                          type="number"
                          value={range.maxScore}
                          onChange={(e) =>
                            handleUpdateScoreRange(
                              idx,
                              "maxScore",
                              parseInt(e.target.value, 10)
                            )
                          }
                          className="mt-1"
                          data-testid={`input-max-score-${idx}`}
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm">Interpretation</Label>
                      <Textarea
                        value={range.interpretation}
                        onChange={(e) =>
                          handleUpdateScoreRange(
                            idx,
                            "interpretation",
                            e.target.value
                          )
                        }
                        placeholder="What does this score range mean?"
                        className="mt-1 resize-none"
                        rows={2}
                        data-testid={`textarea-interpretation-${idx}`}
                      />
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveScoreRange(idx)}
                      className="text-destructive hover:text-destructive"
                      data-testid={`button-remove-score-range-${idx}`}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddScoreRange}
                  className="w-full"
                  data-testid="button-add-score-range"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Score Range
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Results Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Results Summary (Optional)</CardTitle>
              <CardDescription>
                A message shown to respondents above their scores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={resultsSummary}
                onChange={(e) => setResultsSummary(e.target.value)}
                placeholder="e.g., Your results show your dominant leadership style..."
                className="resize-none"
                rows={3}
                data-testid="textarea-results-summary"
              />
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            size="lg"
            className="w-full"
            data-testid="button-save-scoring-config"
          >
            Save Scoring Configuration
          </Button>
        </>
      )}
    </div>
  );
}
