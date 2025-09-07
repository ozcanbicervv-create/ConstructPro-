'use client';

import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Palette, 
  Globe, 
  Shield, 
  Zap, 
  ArrowRight,
  Construction,
  Users,
  BarChart3,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { DemoNavigation } from '@/components/ui/demo-navigation';
import { PageContainer, Section, Grid, Heading, Text } from '@/components/ui/layout-system';
import { InteractiveButton, InteractiveCard, StaggeredList } from '@/components/ui/micro-interactions';
import { PageTransition } from '@/components/ui/page-transition';
import { useSuccessToast } from '@/components/ui/toast-system';

const features = [
  {
    icon: Sparkles,
    title: 'Micro-Interactions',
    description: 'Smooth animations, loading states, and delightful user feedback',
    href: '/test-micro-interactions',
    color: 'from-blue-500 to-purple-600',
  },
  {
    icon: Globe,
    title: 'Accessibility',
    description: 'WCAG 2.1 AA compliance with keyboard navigation and screen reader support',
    href: '/test-accessibility',
    color: 'from-green-500 to-teal-600',
  },
  {
    icon: Palette,
    title: 'Internationalization',
    description: 'Multi-language support with RTL text and cultural adaptations',
    href: '/test-i18n',
    color: 'from-orange-500 to-red-600',
  },
  {
    icon: Shield,
    title: 'Security Features',
    description: 'Enterprise-grade security with multi-factor authentication',
    href: '/test-security',
    color: 'from-purple-500 to-pink-600',
  },
  {
    icon: Zap,
    title: 'Performance',
    description: 'Optimized bundle size, lazy loading, and Core Web Vitals monitoring',
    href: '/performance',
    color: 'from-yellow-500 to-orange-600',
  },
];

const stats = [
  { label: 'Components Built', value: '150+', icon: Construction },
  { label: 'Test Coverage', value: '95%', icon: CheckCircle },
  { label: 'Performance Score', value: '98', icon: BarChart3 },
  { label: 'Accessibility Score', value: '100', icon: Users },
];

export default function Home() {
  const successToast = useSuccessToast();

  return (
    <>
      <DemoNavigation />
      <PageTransition>
        <div className="pt-20">
          <PageContainer maxWidth="2xl">
            {/* Hero Section */}
            <Section spacing="xl">
              <div className="text-center space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-4"
                >
                  <Heading level={1} className="text-5xl md:text-6xl font-display" gradient>
                    Modern Frontend Redesign
                  </Heading>
                  <Text size="xl" color="secondary" className="max-w-3xl mx-auto">
                    A comprehensive showcase of modern design patterns, micro-interactions, 
                    and enterprise-grade features for ConstructPro's construction management platform.
                  </Text>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                  <Link href="/test-micro-interactions">
                    <InteractiveButton variant="primary" size="lg">
                      Explore Features
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </InteractiveButton>
                  </Link>
                  <InteractiveButton 
                    variant="outline" 
                    size="lg"
                    onClick={() => successToast('Welcome!', 'Thanks for exploring our modern design system')}
                  >
                    View Documentation
                  </InteractiveButton>
                </motion.div>
              </div>
            </Section>

            {/* Stats Section */}
            <Section title="Implementation Progress" spacing="lg">
              <Grid cols={4} gap="md">
                <StaggeredList>
                  {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <InteractiveCard key={index} className="text-center space-y-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <Heading level={3} className="text-2xl font-bold text-blue-600">
                            {stat.value}
                          </Heading>
                          <Text color="secondary">{stat.label}</Text>
                        </div>
                      </InteractiveCard>
                    );
                  })}
                </StaggeredList>
              </Grid>
            </Section>

            {/* Features Grid */}
            <Section 
              title="Feature Showcase" 
              subtitle="Explore the modern design system components and interactions"
              spacing="lg"
            >
              <Grid cols={2} gap="lg">
                <StaggeredList>
                  {features.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <Link key={index} href={feature.href}>
                        <InteractiveCard className="h-full space-y-4 group">
                          <div className="flex items-start space-x-4">
                            <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <Heading level={4} className="group-hover:text-blue-600 transition-colors">
                                {feature.title}
                              </Heading>
                              <Text color="secondary" className="mt-2">
                                {feature.description}
                              </Text>
                            </div>
                          </div>
                          <div className="flex items-center text-blue-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                            Explore feature
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </div>
                        </InteractiveCard>
                      </Link>
                    );
                  })}
                </StaggeredList>
              </Grid>
            </Section>

            {/* Design System Preview */}
            <Section 
              title="Design System Components" 
              subtitle="Modern, accessible, and performant UI components"
              spacing="lg"
            >
              <div className="glass-card p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <Heading level={5}>Interactive Buttons</Heading>
                    <div className="space-y-2">
                      <InteractiveButton variant="primary" size="sm">Primary</InteractiveButton>
                      <InteractiveButton variant="secondary" size="sm">Secondary</InteractiveButton>
                      <InteractiveButton variant="outline" size="sm">Outline</InteractiveButton>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Heading level={5}>Typography Scale</Heading>
                    <div className="space-y-2">
                      <Heading level={6}>Heading 6</Heading>
                      <Text>Body text with proper hierarchy</Text>
                      <Text size="sm" color="secondary">Secondary text</Text>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Heading level={5}>Color System</Heading>
                    <div className="flex space-x-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-full"></div>
                      <div className="w-8 h-8 bg-green-600 rounded-full"></div>
                      <div className="w-8 h-8 bg-orange-600 rounded-full"></div>
                      <div className="w-8 h-8 bg-purple-600 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </Section>

            {/* Call to Action */}
            <Section spacing="xl">
              <div className="text-center space-y-6 glass-card p-12">
                <Heading level={2} className="font-display">
                  Ready to Explore?
                </Heading>
                <Text size="lg" color="secondary" className="max-w-2xl mx-auto">
                  Dive into our comprehensive design system and see how modern UI patterns 
                  can transform your construction management experience.
                </Text>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/test-micro-interactions">
                    <InteractiveButton variant="primary" size="lg">
                      Start Exploring
                      <Sparkles className="w-5 h-5 ml-2" />
                    </InteractiveButton>
                  </Link>
                </div>
              </div>
            </Section>
          </PageContainer>
        </div>
      </PageTransition>
    </>
  );
}