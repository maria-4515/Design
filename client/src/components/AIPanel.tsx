import { useState, useCallback, useMemo } from "react";
import { useEditorStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sparkles,
  Wand2,
  Palette,
  Play,
  MessageSquare,
  Image,
  Plus,
  Loader2,
  ChevronDown,
  Lightbulb,
  Send,
  RefreshCw,
  Zap,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { SceneObject, ObjectType, Keyframe, Vector3 } from "@shared/schema";

interface GeneratedObject {
  name: string;
  type: ObjectType;
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
  material: {
    color: string;
    opacity: number;
    metalness: number;
    roughness: number;
  };
}

interface MaterialSuggestion {
  name: string;
  color: string;
  metalness: number;
  roughness: number;
  opacity: number;
  description: string;
}

interface AnimationSuggestion {
  type: string;
  duration: number;
  keyframes: Keyframe[];
  description: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function AIPanel() {
  const { objects, selectedObjectId, updateObject, addGeneratedObject } = useEditorStore();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("generate");
  const [isLoading, setIsLoading] = useState(false);
  
  // Scene generation
  const [scenePrompt, setScenePrompt] = useState("");
  const [generatedObjects, setGeneratedObjects] = useState<GeneratedObject[]>([]);
  
  // Material suggestions
  const [materialDescription, setMaterialDescription] = useState("");
  const [suggestedMaterials, setSuggestedMaterials] = useState<MaterialSuggestion[]>([]);
  
  // Animation suggestions
  const [animationContext, setAnimationContext] = useState("");
  const [suggestedAnimations, setSuggestedAnimations] = useState<AnimationSuggestion[]>([]);
  
  // Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");

  const selectedObject = useMemo(
    () => objects.find((o) => o.id === selectedObjectId),
    [objects, selectedObjectId]
  );

  // Generate scene from prompt
  const handleGenerateScene = useCallback(async () => {
    if (!scenePrompt.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/ai/generate-scene", {
        prompt: scenePrompt,
      });
      const data = await response.json();
      
      setGeneratedObjects(data.objects || []);
      toast({
        title: "Scene Generated",
        description: `Created ${data.objects?.length || 0} objects`,
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Could not generate scene. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [scenePrompt, toast]);

  // Add generated objects to scene using proper store action
  const handleAddGeneratedObjects = useCallback(() => {
    generatedObjects.forEach((obj) => {
      addGeneratedObject({
        type: obj.type,
        name: obj.name,
        position: obj.position,
        rotation: obj.rotation,
        scale: obj.scale,
        material: obj.material,
      });
    });
    
    setGeneratedObjects([]);
    toast({
      title: "Objects Added",
      description: `Added ${generatedObjects.length} objects to the scene`,
    });
  }, [generatedObjects, addGeneratedObject, toast]);

  // Suggest materials
  const handleSuggestMaterials = useCallback(async () => {
    const description = materialDescription.trim() || selectedObject?.name || "object";
    
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/ai/suggest-materials", {
        objectDescription: description,
      });
      const data = await response.json();
      
      setSuggestedMaterials(data.materials || []);
    } catch (error) {
      toast({
        title: "Failed",
        description: "Could not get material suggestions.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [materialDescription, selectedObject, toast]);

  // Apply material to selected object
  const handleApplyMaterial = useCallback((material: MaterialSuggestion) => {
    if (!selectedObjectId) {
      toast({
        title: "No Selection",
        description: "Select an object first.",
        variant: "destructive",
      });
      return;
    }
    
    updateObject(selectedObjectId, {
      material: {
        color: material.color,
        metalness: material.metalness,
        roughness: material.roughness,
        opacity: material.opacity,
      },
    });
    
    toast({
      title: "Material Applied",
      description: `Applied ${material.name} material`,
    });
  }, [selectedObjectId, updateObject, toast]);

  // Suggest animations
  const handleSuggestAnimations = useCallback(async () => {
    if (!selectedObject) {
      toast({
        title: "No Selection",
        description: "Select an object first.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/ai/suggest-animations", {
        objectType: selectedObject.type,
        context: animationContext.trim() || "general 3D scene",
      });
      const data = await response.json();
      
      setSuggestedAnimations(data.animations || []);
    } catch (error) {
      toast({
        title: "Failed",
        description: "Could not get animation suggestions.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedObject, animationContext, toast]);

  // Apply animation to selected object
  const handleApplyAnimation = useCallback((animation: AnimationSuggestion) => {
    if (!selectedObjectId) return;
    
    updateObject(selectedObjectId, {
      keyframes: animation.keyframes.map((kf) => ({
        frame: kf.frame,
        position: kf.position,
        rotation: kf.rotation,
        scale: kf.scale,
      })),
    });
    
    toast({
      title: "Animation Applied",
      description: animation.description,
    });
  }, [selectedObjectId, updateObject, toast]);

  // Chat with AI
  const handleSendChat = useCallback(async () => {
    if (!chatInput.trim()) return;
    
    const userMessage: ChatMessage = { role: "user", content: chatInput };
    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setIsLoading(true);
    
    try {
      const sceneContext = `Objects in scene: ${objects.map((o) => `${o.name} (${o.type})`).join(", ")}`;
      
      const response = await apiRequest("POST", "/api/ai/chat", {
        messages: [...chatMessages, userMessage],
        sceneContext,
      });
      const data = await response.json();
      
      const assistantMessage: ChatMessage = { role: "assistant", content: data.response };
      setChatMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      toast({
        title: "Chat Error",
        description: "Could not get AI response.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [chatInput, chatMessages, objects, toast]);

  // Quick actions
  const quickActions = useMemo(() => [
    { label: "Add table with chairs", prompt: "A simple wooden table with 4 chairs around it" },
    { label: "Create abstract sculpture", prompt: "An abstract modern art sculpture with geometric shapes" },
    { label: "Build simple room", prompt: "A minimalist room with floor, walls, and basic furniture" },
    { label: "Outdoor park scene", prompt: "A small park with trees, bench, and lamp post" },
  ], []);

  return (
    <div className="h-full flex flex-col bg-background" data-testid="ai-panel">
      <div className="p-3 border-b border-border flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="font-medium text-sm">AI Assistant</span>
        <Badge variant="secondary" className="ml-auto text-[10px]">
          Beta
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="mx-2 mt-2 grid grid-cols-4">
          <TabsTrigger value="generate" className="text-xs">
            <Wand2 className="h-3 w-3" />
          </TabsTrigger>
          <TabsTrigger value="materials" className="text-xs">
            <Palette className="h-3 w-3" />
          </TabsTrigger>
          <TabsTrigger value="animate" className="text-xs">
            <Play className="h-3 w-3" />
          </TabsTrigger>
          <TabsTrigger value="chat" className="text-xs">
            <MessageSquare className="h-3 w-3" />
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <TabsContent value="generate" className="p-3 space-y-3 m-0">
            <div className="space-y-2">
              <Label className="text-xs">Describe your scene</Label>
              <Textarea
                placeholder="A forest clearing with mushrooms and glowing fireflies..."
                value={scenePrompt}
                onChange={(e) => setScenePrompt(e.target.value)}
                className="min-h-[80px] text-xs resize-none"
                data-testid="input-scene-prompt"
              />
              <Button
                onClick={handleGenerateScene}
                disabled={isLoading || !scenePrompt.trim()}
                className="w-full"
                size="sm"
                data-testid="button-generate-scene"
              >
                {isLoading ? (
                  <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5 mr-2" />
                )}
                Generate Scene
              </Button>
            </div>

            {generatedObjects.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Generated Objects ({generatedObjects.length})</Label>
                  <Button size="sm" variant="outline" onClick={handleAddGeneratedObjects} data-testid="button-add-generated">
                    <Plus className="h-3 w-3 mr-1" />
                    Add All
                  </Button>
                </div>
                <div className="space-y-1">
                  {generatedObjects.map((obj, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-2 rounded bg-muted/50 text-xs"
                    >
                      <div
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: obj.material.color }}
                      />
                      <span className="flex-1 truncate">{obj.name}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {obj.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Collapsible>
              <CollapsibleTrigger className="flex items-center gap-2 w-full py-2 text-xs text-muted-foreground">
                <Lightbulb className="h-3 w-3" />
                <span>Quick Actions</span>
                <ChevronDown className="h-3 w-3 ml-auto" />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 pt-1">
                {quickActions.map((action, i) => (
                  <Button
                    key={i}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs h-7"
                    onClick={() => setScenePrompt(action.prompt)}
                    data-testid={`quick-action-${i}`}
                  >
                    <Zap className="h-3 w-3 mr-2 text-primary" />
                    {action.label}
                  </Button>
                ))}
              </CollapsibleContent>
            </Collapsible>
          </TabsContent>

          <TabsContent value="materials" className="p-3 space-y-3 m-0">
            <div className="space-y-2">
              <Label className="text-xs">Material description (optional)</Label>
              <Input
                placeholder="e.g., rusty metal, polished marble..."
                value={materialDescription}
                onChange={(e) => setMaterialDescription(e.target.value)}
                className="h-8 text-xs"
                data-testid="input-material-description"
              />
              <Button
                onClick={handleSuggestMaterials}
                disabled={isLoading}
                className="w-full"
                size="sm"
                data-testid="button-suggest-materials"
              >
                {isLoading ? (
                  <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                ) : (
                  <Palette className="h-3.5 w-3.5 mr-2" />
                )}
                Suggest Materials
              </Button>
            </div>

            {suggestedMaterials.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs">Suggestions</Label>
                {suggestedMaterials.map((mat, i) => (
                  <Card
                    key={i}
                    className="p-2 cursor-pointer hover-elevate"
                    onClick={() => handleApplyMaterial(mat)}
                    data-testid={`material-suggestion-${i}`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded"
                        style={{
                          backgroundColor: mat.color,
                          opacity: mat.opacity,
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{mat.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {mat.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="animate" className="p-3 space-y-3 m-0">
            {selectedObject ? (
              <>
                <div className="p-2 rounded bg-muted/50">
                  <p className="text-xs text-muted-foreground">Selected:</p>
                  <p className="text-sm font-medium">{selectedObject.name}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs">Animation context</Label>
                  <Input
                    placeholder="e.g., floating in space, bouncing ball..."
                    value={animationContext}
                    onChange={(e) => setAnimationContext(e.target.value)}
                    className="h-8 text-xs"
                    data-testid="input-animation-context"
                  />
                  <Button
                    onClick={handleSuggestAnimations}
                    disabled={isLoading}
                    className="w-full"
                    size="sm"
                    data-testid="button-suggest-animations"
                  >
                    {isLoading ? (
                      <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                    ) : (
                      <Play className="h-3.5 w-3.5 mr-2" />
                    )}
                    Suggest Animations
                  </Button>
                </div>

                {suggestedAnimations.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs">Animations</Label>
                    {suggestedAnimations.map((anim, i) => (
                      <Card
                        key={i}
                        className="p-2 cursor-pointer hover-elevate"
                        onClick={() => handleApplyAnimation(anim)}
                        data-testid={`animation-suggestion-${i}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium capitalize">{anim.type}</p>
                            <p className="text-[10px] text-muted-foreground truncate">
                              {anim.description}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-[10px]">
                            {anim.duration}f
                          </Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-xs">
                Select an object to get animation suggestions
              </div>
            )}
          </TabsContent>

          <TabsContent value="chat" className="p-0 m-0 flex flex-col h-[400px]">
            <ScrollArea className="flex-1 p-3">
              <div className="space-y-3">
                {chatMessages.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-xs">
                    Ask me anything about your 3D scene
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] p-2 rounded-lg text-xs ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted p-2 rounded-lg">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            <div className="p-2 border-t border-border flex gap-2">
              <Input
                placeholder="Ask about your scene..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                className="h-8 text-xs"
                data-testid="input-chat"
              />
              <Button
                size="icon"
                onClick={handleSendChat}
                disabled={isLoading || !chatInput.trim()}
                data-testid="button-send-chat"
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
