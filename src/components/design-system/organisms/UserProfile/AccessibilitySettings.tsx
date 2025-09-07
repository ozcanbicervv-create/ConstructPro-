"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AccessibleButton } from '@/components/ui/accessible-button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { 
  Eye, 
  MousePointer,
  Keyboard,
  Monitor,
  Sun,
  Moon,
  Contrast,
  Focus,
  RotateCcw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAccessibility } from '@/lib/accessibility';
import { Button } from '@/components/ui/button';



interface AccessibilitySettingsProps {
  className?: string;
}

const themes = [
  { id: 'light', name: 'Light', icon: <Sun className="h-4 w-4" /> },
  { id: 'dark', name: 'Dark', icon: <Moon className="h-4 w-4" /> },
  { id: 'system', name: 'System', icon: <Monitor className="h-4 w-4" /> },
  { id: 'high-contrast', name: 'High Contrast', icon: <Contrast className="h-4 w-4" /> }
];

const fontFamilies = [
  { id: 'default', name: 'Default (Inter)', sample: 'The quick brown fox jumps over the lazy dog' },
  { id: 'dyslexic', name: 'Dyslexic Friendly (OpenDyslexic)', sample: 'The quick brown fox jumps over the lazy dog' },
  { id: 'mono', name: 'Monospace (JetBrains Mono)', sample: 'The quick brown fox jumps over the lazy dog' }
];

const colorBlindnessOptions = [
  { id: 'none', name: 'None', description: 'Normal color vision' },
  { id: 'protanopia', name: 'Protanopia', description: 'Red-blind (1% of males)' },
  { id: 'deuteranopia', name: 'Deuteranopia', description: 'Green-blind (1% of males)' },
  { id: 'tritanopia', name: 'Tritanopia', description: 'Blue-blind (rare)' }
];

export function AccessibilitySettings({ className = "" }: AccessibilitySettingsProps) {
  const { preferences, updatePreference, screenReader } = useAccessibility();
  const [isLoading, setIsLoading] = useState(false);
  const [previewText] = useState("This is a preview of how text will appear with your current settings.");
  const { toast } = useToast();

  const handleSavePreferences = async () => {
    setIsLoading(true);
    try {
      // Preferences are automatically saved by the accessibility manager
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "Accessibility Settings Saved",
        description: "Your accessibility preferences have been applied.",
      });
      
      screenReader.announceSuccess("Accessibility settings saved successfully");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save accessibility settings.",
        variant: "destructive",
      });
      
      screenReader.announceError("Failed to save accessibility settings");
    } finally {
      setIsLoading(false);
    }
  };



  const resetToDefaults = () => {
    // Reset each preference individually
    updatePreference('theme', 'system');
    updatePreference('fontSize', 16);
    updatePreference('fontFamily', 'default');
    updatePreference('lineHeight', 1.5);
    updatePreference('letterSpacing', 0);
    updatePreference('colorBlindness', 'none');
    updatePreference('reducedMotion', false);
    updatePreference('stickyKeys', false);
    updatePreference('slowKeys', false);
    updatePreference('mouseKeys', false);
    updatePreference('clickDelay', 0);
    updatePreference('focusIndicators', true);
    updatePreference('simplifiedUI', false);
    updatePreference('autoSave', true);
    updatePreference('confirmActions', false);
    updatePreference('soundEffects', true);
    updatePreference('screenReader', false);
    updatePreference('audioDescriptions', false);
    updatePreference('keyboardNavigation', true);
    updatePreference('skipLinks', true);
    updatePreference('breadcrumbs', true);
    
    toast({
      title: "Settings Reset",
      description: "All accessibility settings have been reset to defaults.",
    });
    
    screenReader.announce("Accessibility settings reset to defaults", "polite");
  };

  // Preferences are automatically applied by the accessibility manager

  const getPreviewStyle = () => {
    const fontFamilyMap = {
      default: 'Inter, system-ui, sans-serif',
      dyslexic: 'OpenDyslexic, sans-serif',
      mono: 'JetBrains Mono, monospace'
    };

    return {
      fontSize: `${preferences.fontSize}px`,
      fontFamily: fontFamilyMap[preferences.fontFamily],
      lineHeight: preferences.lineHeight,
      letterSpacing: `${preferences.letterSpacing}px`,
      transition: preferences.reducedMotion ? 'none' : 'all 0.2s ease'
    };
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Visual Settings */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Visual Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Theme</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {themes.map((theme) => (
                <Button
                  key={theme.id}
                  variant={preferences.theme === theme.id ? "default" : "outline"}
                  onClick={() => updatePreference('theme', theme.id as any)}
                  className="flex items-center gap-2 h-auto p-3"
                >
                  {theme.icon}
                  <span className="text-sm">{theme.name}</span>
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Font Settings */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Typography</Label>
            
            <div className="space-y-3">
              <div>
                <Label>Font Size: {preferences.fontSize}px</Label>
                <Slider
                  value={[preferences.fontSize]}
                  onValueChange={([value]) => updatePreference('fontSize', value)}
                  min={12}
                  max={24}
                  step={1}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label>Line Height: {preferences.lineHeight}</Label>
                <Slider
                  value={[preferences.lineHeight]}
                  onValueChange={([value]) => updatePreference('lineHeight', value)}
                  min={1.2}
                  max={2.0}
                  step={0.1}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label>Letter Spacing: {preferences.letterSpacing}px</Label>
                <Slider
                  value={[preferences.letterSpacing]}
                  onValueChange={([value]) => updatePreference('letterSpacing', value)}
                  min={-1}
                  max={3}
                  step={0.1}
                  className="mt-2"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Font Family</Label>
              <div className="space-y-2">
                {fontFamilies.map((font) => (
                  <div key={font.id} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={font.id}
                      name="fontFamily"
                      checked={preferences.fontFamily === font.id}
                      onChange={() => updatePreference('fontFamily', font.id as any)}
                      className="w-4 h-4"
                    />
                    <Label htmlFor={font.id} className="flex-1 cursor-pointer">
                      <div className="font-medium">{font.name}</div>
                      <div className="text-sm text-muted-foreground" style={{ fontFamily: font.id === 'mono' ? 'monospace' : 'inherit' }}>
                        {font.sample}
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          {/* Color Blindness Support */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Color Vision</Label>
            <div className="space-y-2">
              {colorBlindnessOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={option.id}
                    name="colorBlindness"
                    checked={preferences.colorBlindness === option.id}
                    onChange={() => updatePreference('colorBlindness', option.id as any)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                    <div className="font-medium">{option.name}</div>
                    <div className="text-sm text-muted-foreground">{option.description}</div>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Preview</Label>
            <div 
              className="p-4 border rounded-lg bg-background"
              style={getPreviewStyle()}
            >
              {previewText}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Motor Settings */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MousePointer className="h-5 w-5" />
            Motor & Interaction
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Reduced Motion</Label>
              <p className="text-sm text-muted-foreground">Minimize animations and transitions</p>
            </div>
            <Switch
              checked={preferences.reducedMotion}
              onCheckedChange={(checked) => updatePreference('reducedMotion', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Sticky Keys</Label>
              <p className="text-sm text-muted-foreground">Press modifier keys one at a time</p>
            </div>
            <Switch
              checked={preferences.stickyKeys}
              onCheckedChange={(checked) => updatePreference('stickyKeys', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Slow Keys</Label>
              <p className="text-sm text-muted-foreground">Ignore brief key presses</p>
            </div>
            <Switch
              checked={preferences.slowKeys}
              onCheckedChange={(checked) => updatePreference('slowKeys', checked)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Click Delay: {preferences.clickDelay}ms</Label>
            <p className="text-sm text-muted-foreground">Delay before registering clicks</p>
            <Slider
              value={[preferences.clickDelay]}
              onValueChange={([value]) => updatePreference('clickDelay', value)}
              min={0}
              max={1000}
              step={50}
            />
          </div>
        </CardContent>
      </Card>

      {/* Cognitive Settings */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Focus className="h-5 w-5" />
            Cognitive Support
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enhanced Focus Indicators</Label>
              <p className="text-sm text-muted-foreground">Stronger visual focus indicators</p>
            </div>
            <Switch
              checked={preferences.focusIndicators}
              onCheckedChange={(checked) => updatePreference('focusIndicators', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Simplified UI</Label>
              <p className="text-sm text-muted-foreground">Hide non-essential interface elements</p>
            </div>
            <Switch
              checked={preferences.simplifiedUI}
              onCheckedChange={(checked) => updatePreference('simplifiedUI', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-save</Label>
              <p className="text-sm text-muted-foreground">Automatically save changes</p>
            </div>
            <Switch
              checked={preferences.autoSave}
              onCheckedChange={(checked) => updatePreference('autoSave', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Confirm Actions</Label>
              <p className="text-sm text-muted-foreground">Ask for confirmation on important actions</p>
            </div>
            <Switch
              checked={preferences.confirmActions}
              onCheckedChange={(checked) => updatePreference('confirmActions', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Navigation Settings */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Navigation & Audio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Keyboard Navigation</Label>
              <p className="text-sm text-muted-foreground">Navigate using keyboard only</p>
            </div>
            <Switch
              checked={preferences.keyboardNavigation}
              onCheckedChange={(checked) => updatePreference('keyboardNavigation', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Skip Links</Label>
              <p className="text-sm text-muted-foreground">Show skip navigation links</p>
            </div>
            <Switch
              checked={preferences.skipLinks}
              onCheckedChange={(checked) => updatePreference('skipLinks', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Sound Effects</Label>
              <p className="text-sm text-muted-foreground">Play UI sound effects</p>
            </div>
            <Switch
              checked={preferences.soundEffects}
              onCheckedChange={(checked) => updatePreference('soundEffects', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Screen Reader Support</Label>
              <p className="text-sm text-muted-foreground">Optimize for screen readers</p>
            </div>
            <Switch
              checked={preferences.screenReader}
              onCheckedChange={(checked) => updatePreference('screenReader', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <AccessibleButton
          variant="outline"
          onClick={resetToDefaults}
          className="flex items-center gap-2"
          announceOnClick="Accessibility settings reset to defaults"
        >
          <RotateCcw className="h-4 w-4" />
          Reset to Defaults
        </AccessibleButton>
        
        <AccessibleButton 
          onClick={handleSavePreferences} 
          disabled={isLoading}
          loading={isLoading}
          loadingText="Saving accessibility settings..."
          announceOnClick="Accessibility settings saved"
        >
          Save Accessibility Settings
        </AccessibleButton>
      </div>
    </div>
  );
}

export default AccessibilitySettings;