import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import type { AIConfiguration, UpdateAIConfigRequest } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Settings, Save } from 'lucide-react';
import { format } from 'date-fns';

export default function Configuration() {
  const [config, setConfig] = useState<AIConfiguration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<UpdateAIConfigRequest>({});
  const { toast } = useToast();

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const configData = await api.getAIConfiguration();
      setConfig(configData);
      setFormData({
        llmProvider: configData.llmProvider,
        model: configData.model || '',
        temperature: configData.temperature || undefined,
        maxTokens: configData.maxTokens || undefined,
        topP: configData.topP || undefined,
        topK: configData.topK || undefined,
        frequencyPenalty: configData.frequencyPenalty || undefined,
        presencePenalty: configData.presencePenalty || undefined,
        stopSequences: configData.stopSequences || undefined,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load configuration',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updateData: UpdateAIConfigRequest = {};
      
      if (formData.llmProvider) updateData.llmProvider = formData.llmProvider;
      if (formData.model !== undefined) updateData.model = formData.model || null;
      if (formData.temperature !== undefined) updateData.temperature = formData.temperature || null;
      if (formData.maxTokens !== undefined) updateData.maxTokens = formData.maxTokens || null;
      if (formData.topP !== undefined) updateData.topP = formData.topP || null;
      if (formData.topK !== undefined) updateData.topK = formData.topK || null;
      if (formData.frequencyPenalty !== undefined) updateData.frequencyPenalty = formData.frequencyPenalty || null;
      if (formData.presencePenalty !== undefined) updateData.presencePenalty = formData.presencePenalty || null;
      if (formData.stopSequences !== undefined) updateData.stopSequences = formData.stopSequences || null;

      const updatedConfig = await api.updateAIConfiguration(updateData);
      setConfig(updatedConfig);
      toast({
        title: 'Success',
        description: 'Configuration updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update configuration',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!config) {
    return <div>No configuration found</div>;
  }

  const isOpenAI = formData.llmProvider === 'OPENAI';
  const isGemini = formData.llmProvider === 'GEMINI';
  const isAnthropic = formData.llmProvider === 'ANTHROPIC';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuration</h1>
        <p className="text-muted-foreground">Configure AI settings for the RAG system</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            AI Configuration
          </CardTitle>
          <CardDescription>
            Global AI configuration settings. Last updated: {format(new Date(config.updatedAt), 'PPp')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="provider">LLM Provider *</Label>
              <Select
                value={formData.llmProvider}
                onValueChange={(value: "OPENAI" | "GEMINI" | "ANTHROPIC") =>
                  setFormData({ ...formData, llmProvider: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPENAI">OpenAI</SelectItem>
                  <SelectItem value="GEMINI">Google Gemini</SelectItem>
                  <SelectItem value="ANTHROPIC">Anthropic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={formData.model || ''}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="e.g., gpt-4, gemini-pro, claude-3-sonnet-20240229"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="temperature">
                Temperature
                {isOpenAI || isAnthropic ? ' (0.0 - 1.0)' : ' (0.0 - 2.0)'}
              </Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                min="0"
                max={isGemini ? "2" : "1"}
                value={formData.temperature ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    temperature: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
                placeholder="0.7"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxTokens">Max Tokens</Label>
              <Input
                id="maxTokens"
                type="number"
                min="1"
                value={formData.maxTokens ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxTokens: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                placeholder="2048"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="topP">Top P (0.0 - 1.0)</Label>
              <Input
                id="topP"
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={formData.topP ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    topP: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
                placeholder="1.0"
              />
            </div>

            {(isGemini || isAnthropic) && (
              <div className="space-y-2">
                <Label htmlFor="topK">Top K</Label>
                <Input
                  id="topK"
                  type="number"
                  min="1"
                  value={formData.topK ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      topK: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  placeholder="40"
                />
              </div>
            )}

            {isOpenAI && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="frequencyPenalty">
                    Frequency Penalty (-2.0 - 2.0)
                  </Label>
                  <Input
                    id="frequencyPenalty"
                    type="number"
                    step="0.1"
                    min="-2"
                    max="2"
                    value={formData.frequencyPenalty ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        frequencyPenalty: e.target.value ? parseFloat(e.target.value) : undefined,
                      })
                    }
                    placeholder="0.0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="presencePenalty">
                    Presence Penalty (-2.0 - 2.0)
                  </Label>
                  <Input
                    id="presencePenalty"
                    type="number"
                    step="0.1"
                    min="-2"
                    max="2"
                    value={formData.presencePenalty ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        presencePenalty: e.target.value ? parseFloat(e.target.value) : undefined,
                      })
                    }
                    placeholder="0.0"
                  />
                </div>
              </>
            )}

            {(isGemini || isAnthropic) && (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="stopSequences">Stop Sequences (comma-separated)</Label>
                <Input
                  id="stopSequences"
                  value={formData.stopSequences?.join(', ') || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stopSequences: e.target.value
                        ? e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                        : undefined,
                    })
                  }
                  placeholder="stop1, stop2, stop3"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

