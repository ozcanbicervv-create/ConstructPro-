'use client';

import { useState } from 'react';
import { Plus, Download, Settings, Heart, Star, Share2 } from 'lucide-react';
import { PageTransition } from '@/components/ui/page-transition';
import { 
  InteractiveButton, 
  InteractiveCard, 
  StaggeredList,
  FloatingActionButton,
  AnimatedProgress
} from '@/components/ui/micro-interactions';
import {
  NoProjectsEmpty,
  NoSearchResultsEmpty,
  SuccessState,
  LoadingEmpty
} from '@/components/ui/empty-states';
import {
  PageContainer,
  Section,
  Grid,
  Flex,
  Card,
  Heading,
  Text
} from '@/components/ui/layout-system';
import {
  Spinner,
  DotsLoader,
  PulseLoader,
  WaveLoader,
  LoadingOverlay,
  LoadingButton,
  AnimatedProgressBar,
  CardSkeleton,
  ListSkeleton
} from '@/components/ui/loading-animations';
import {
  ToastProvider,
  useToast,
  useSuccessToast,
  useErrorToast,
  useWarningToast,
  useInfoToast
} from '@/components/ui/toast-system';

function MicroInteractionsDemo() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showEmpty, setShowEmpty] = useState('none');
  const [showSkeletons, setShowSkeletons] = useState(false);

  const { addToast } = useToast();
  const successToast = useSuccessToast();
  const errorToast = useErrorToast();
  const warningToast = useWarningToast();
  const infoToast = useInfoToast();

  const handleLoadingDemo = async () => {
    setLoading(true);
    setProgress(0);
    
    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setLoading(false);
          setShowSuccess(true);
          successToast('Operation completed!', 'Your task has been processed successfully.');
          setTimeout(() => setShowSuccess(false), 3000);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleSkeletonDemo = () => {
    setShowSkeletons(true);
    setTimeout(() => setShowSkeletons(false), 3000);
  };

  const demoCards = [
    { id: 1, title: 'Project Alpha', description: 'Construction management system', status: 'active' },
    { id: 2, title: 'Building Beta', description: 'Residential complex development', status: 'planning' },
    { id: 3, title: 'Infrastructure Gamma', description: 'Road and bridge construction', status: 'completed' },
  ];

  return (
    <PageTransition>
      <PageContainer maxWidth="2xl">
        <Section
          title="Micro-Interactions & Polish Demo"
          subtitle="Showcasing smooth animations, loading states, and delightful user feedback"
          spacing="lg"
        >
          {/* Interactive Buttons */}
          <Section title="Interactive Buttons" spacing="md">
            <Flex direction="row" gap="sm" wrap>
              <InteractiveButton variant="primary" onClick={() => successToast('Success!', 'Button clicked successfully')}>
                Primary Action
              </InteractiveButton>
              <InteractiveButton variant="secondary" onClick={() => infoToast('Info', 'Secondary button pressed')}>
                Secondary Action
              </InteractiveButton>
              <InteractiveButton variant="ghost" onClick={() => warningToast('Warning', 'Ghost button activated')}>
                Ghost Action
              </InteractiveButton>
              <LoadingButton
                isLoading={loading}
                loadingText="Processing..."
                onClick={handleLoadingDemo}
              >
                Start Process
              </LoadingButton>
            </Flex>
          </Section>

          {/* Interactive Cards */}
          <Section title="Interactive Cards" spacing="md">
            <Grid cols={3} gap="md">
              <StaggeredList>
                {demoCards.map(card => (
                  <InteractiveCard
                    key={card.id}
                    onClick={() => infoToast('Card Selected', `You selected ${card.title}`)}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <Heading level={4}>{card.title}</Heading>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        card.status === 'active' ? 'bg-green-100 text-green-800' :
                        card.status === 'planning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {card.status}
                      </div>
                    </div>
                    <Text color="secondary">{card.description}</Text>
                    <Flex direction="row" gap="xs">
                      <InteractiveButton size="sm" variant="ghost">
                        <Heart className="w-4 h-4" />
                      </InteractiveButton>
                      <InteractiveButton size="sm" variant="ghost">
                        <Star className="w-4 h-4" />
                      </InteractiveButton>
                      <InteractiveButton size="sm" variant="ghost">
                        <Share2 className="w-4 h-4" />
                      </InteractiveButton>
                    </Flex>
                  </InteractiveCard>
                ))}
              </StaggeredList>
            </Grid>
          </Section>

          {/* Progress Indicators */}
          <Section title="Progress & Loading States" spacing="md">
            <Grid cols={2} gap="lg">
              <Card padding="md">
                <Heading level={5} className="mb-4">Animated Progress</Heading>
                <div className="space-y-4">
                  <AnimatedProgress value={progress} showLabel />
                  <AnimatedProgressBar progress={75} color="green" />
                  <AnimatedProgressBar progress={45} color="yellow" />
                  <AnimatedProgressBar progress={90} color="blue" />
                </div>
              </Card>

              <Card padding="md">
                <Heading level={5} className="mb-4">Loading Animations</Heading>
                <div className="space-y-4">
                  <Flex direction="row" gap="md" align="center">
                    <Spinner size="sm" />
                    <DotsLoader />
                    <PulseLoader />
                    <WaveLoader />
                  </Flex>
                  <InteractiveButton onClick={handleSkeletonDemo} variant="outline">
                    Show Skeleton Loading
                  </InteractiveButton>
                </div>
              </Card>
            </Grid>
          </Section>

          {/* Loading Overlay Demo */}
          <Section title="Loading Overlay" spacing="md">
            <LoadingOverlay isLoading={showSkeletons} loadingText="Loading content...">
              <Card padding="md">
                {showSkeletons ? (
                  <div className="space-y-6">
                    <ListSkeleton items={3} />
                    <div className="grid grid-cols-2 gap-4">
                      <CardSkeleton />
                      <CardSkeleton />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Heading level={5}>Content Area</Heading>
                    <Text>This content will be overlaid with a loading state when the skeleton demo is active.</Text>
                    <Flex direction="row" gap="sm">
                      <InteractiveButton size="sm">Action 1</InteractiveButton>
                      <InteractiveButton size="sm" variant="outline">Action 2</InteractiveButton>
                    </Flex>
                  </div>
                )}
              </Card>
            </LoadingOverlay>
          </Section>

          {/* Toast Notifications */}
          <Section title="Toast Notifications" spacing="md">
            <Grid cols={2} gap="md">
              <Card padding="md">
                <Heading level={5} className="mb-4">Basic Toasts</Heading>
                <Flex direction="col" gap="sm">
                  <InteractiveButton 
                    onClick={() => successToast('Success!', 'Operation completed successfully')}
                    variant="primary"
                    size="sm"
                  >
                    Success Toast
                  </InteractiveButton>
                  <InteractiveButton 
                    onClick={() => errorToast('Error!', 'Something went wrong')}
                    variant="secondary"
                    size="sm"
                  >
                    Error Toast
                  </InteractiveButton>
                  <InteractiveButton 
                    onClick={() => warningToast('Warning!', 'Please check your input')}
                    variant="ghost"
                    size="sm"
                  >
                    Warning Toast
                  </InteractiveButton>
                  <InteractiveButton 
                    onClick={() => infoToast('Info', 'Here is some information')}
                    variant="ghost"
                    size="sm"
                  >
                    Info Toast
                  </InteractiveButton>
                </Flex>
              </Card>

              <Card padding="md">
                <Heading level={5} className="mb-4">Advanced Toasts</Heading>
                <Flex direction="col" gap="sm">
                  <InteractiveButton 
                    onClick={() => addToast({
                      type: 'success',
                      title: 'File uploaded',
                      description: 'Your document has been uploaded successfully',
                      action: {
                        label: 'View file',
                        onClick: () => infoToast('Action clicked', 'Toast action was triggered')
                      }
                    })}
                    variant="primary"
                    size="sm"
                  >
                    Toast with Action
                  </InteractiveButton>
                  <InteractiveButton 
                    onClick={() => addToast({
                      type: 'info',
                      title: 'Persistent notification',
                      description: 'This toast will not auto-dismiss',
                      duration: 0
                    })}
                    variant="outline"
                    size="sm"
                  >
                    Persistent Toast
                  </InteractiveButton>
                </Flex>
              </Card>
            </Grid>
          </Section>

          {/* Empty States */}
          <Section title="Empty States & Success Confirmations" spacing="md">
            <Grid cols={3} gap="sm">
              <InteractiveButton 
                onClick={() => setShowEmpty('projects')}
                variant="outline"
                size="sm"
              >
                No Projects
              </InteractiveButton>
              <InteractiveButton 
                onClick={() => setShowEmpty('search')}
                variant="outline"
                size="sm"
              >
                No Search Results
              </InteractiveButton>
              <InteractiveButton 
                onClick={() => setShowEmpty('success')}
                variant="outline"
                size="sm"
              >
                Success State
              </InteractiveButton>
            </Grid>

            {showEmpty !== 'none' && (
              <Card padding="lg" className="mt-6">
                {showEmpty === 'projects' && (
                  <NoProjectsEmpty onCreateProject={() => {
                    setShowEmpty('none');
                    successToast('Project created!', 'Your new project has been created');
                  }} />
                )}
                {showEmpty === 'search' && (
                  <NoSearchResultsEmpty 
                    query="construction materials"
                    onClearSearch={() => setShowEmpty('none')}
                  />
                )}
                {showEmpty === 'success' && (
                  <SuccessState
                    title="Project Created Successfully!"
                    description="Your construction project has been set up and is ready for team collaboration."
                    action={{
                      label: "View Project",
                      onClick: () => setShowEmpty('none')
                    }}
                  />
                )}
              </Card>
            )}
          </Section>

          {/* Floating Action Button */}
          <FloatingActionButton
            icon={<Plus className="w-6 h-6" />}
            label="Create New"
            onClick={() => successToast('FAB clicked!', 'Floating action button was pressed')}
          />
        </Section>
      </PageContainer>
    </PageTransition>
  );
}

export default function MicroInteractionsPage() {
  return (
    <ToastProvider>
      <MicroInteractionsDemo />
    </ToastProvider>
  );
}