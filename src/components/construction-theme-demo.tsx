'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Building2, Hammer, HardHat, Wrench } from 'lucide-react'

export default function ConstructionThemeDemo() {
  return (
    <div className="p-8 space-y-8 bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gradient">ConstructPro Theme Demo</h1>
        <p className="text-muted-foreground">Construction Industry Yellow-Black Professional Color Palette</p>
      </div>

      {/* Color Palette Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Construction Color Palette</CardTitle>
          <CardDescription>Professional yellow-black theme for construction industry</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="construction-yellow p-4 rounded-lg text-center">
              <p className="font-semibold">Primary Yellow</p>
              <p className="text-sm opacity-80">Construction Brand</p>
            </div>
            <div className="construction-black p-4 rounded-lg text-center">
              <p className="font-semibold">Professional Black</p>
              <p className="text-sm opacity-80">Industry Standard</p>
            </div>
            <div className="bg-accent text-accent-foreground p-4 rounded-lg text-center">
              <p className="font-semibold">Accent Yellow</p>
              <p className="text-sm opacity-80">Highlights</p>
            </div>
            <div className="bg-muted text-muted-foreground p-4 rounded-lg text-center">
              <p className="font-semibold">Muted Gray</p>
              <p className="text-sm opacity-80">Backgrounds</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Component Examples */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="construction-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Project Management
            </CardTitle>
            <CardDescription>Professional construction project tools</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Badge variant="default" className="bg-primary text-primary-foreground">
                <HardHat className="w-3 h-3 mr-1" />
                Active Project
              </Badge>
              <Badge variant="secondary">
                <Hammer className="w-3 h-3 mr-1" />
                In Progress
              </Badge>
            </div>
            <Button className="w-full gradient-primary">
              <Wrench className="w-4 h-4 mr-2" />
              Manage Project
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader>
            <CardTitle>Glass Effect Card</CardTitle>
            <CardDescription>Modern glass effect with construction theme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="construction-pattern p-4 rounded-lg">
              <p className="text-center font-medium">Construction Pattern Background</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Animation Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Animation Examples</CardTitle>
          <CardDescription>Construction-themed animations and effects</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button className="animate-pulse-glow">
              Pulse Glow Effect
            </Button>
            <div className="animate-float">
              <Badge variant="outline">Floating Badge</Badge>
            </div>
            <Button variant="outline" className="animate-slide-up construction-border">
              Slide Up Animation
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Gradient Examples */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="gradient-primary p-8 rounded-lg text-center text-primary-foreground">
          <h3 className="text-2xl font-bold mb-2">Primary Gradient</h3>
          <p>Construction yellow gradient background</p>
        </div>
        <div className="gradient-accent p-8 rounded-lg text-center text-white">
          <h3 className="text-2xl font-bold mb-2">Accent Gradient</h3>
          <p>Professional accent gradient</p>
        </div>
      </div>
    </div>
  )
}