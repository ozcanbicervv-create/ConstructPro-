'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import ARIntegration from './ar-integration'
import { 
  BarChart3, 
  Calendar, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  FileText,
  MessageSquare,
  Settings,
  Target,
  Zap,
  Building2,
  Truck,
  Wrench,
  HardHat,
  Box
} from 'lucide-react'

interface Project {
  id: string
  name: string
  client: string
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold'
  progress: number
  budget: number
  spent: number
  startDate: string
  endDate: string
  team: string[]
  priority: 'low' | 'medium' | 'high'
  location: string
  type: 'residential' | 'commercial' | 'industrial' | 'infrastructure'
}

interface Task {
  id: string
  title: string
  project: string
  assignee: string
  status: 'todo' | 'in-progress' | 'review' | 'completed'
  priority: 'low' | 'medium' | 'high'
  dueDate: string
  estimatedHours: number
  actualHours: number
}

interface TeamMember {
  id: string
  name: string
  role: string
  avatar: string
  status: 'available' | 'busy' | 'offline'
  currentTask?: string
}

export default function ProjectManagement() {
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [team, setTeam] = useState<TeamMember[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [activeTab, setActiveTab] = useState('overview')

  // Demo veri
  const demoProjects: Project[] = [
    {
      id: '1',
      name: 'Modern Villa Projesi',
      client: 'Ahmet Yılmaz',
      status: 'in-progress',
      progress: 65,
      budget: 2500000,
      spent: 1625000,
      startDate: '2024-01-15',
      endDate: '2024-08-30',
      team: ['Ahmet Kaya', 'Ayşe Demir', 'Mehmet Öz'],
      priority: 'high',
      location: 'Ataşehir, İstanbul',
      type: 'residential'
    },
    {
      id: '2',
      name: 'Ofis Binası Restorasyon',
      client: 'Tech Solutions AŞ',
      status: 'planning',
      progress: 25,
      budget: 1800000,
      spent: 450000,
      startDate: '2024-03-01',
      endDate: '2024-12-15',
      team: ['Zeynep Arslan', 'Can Yılmaz'],
      priority: 'medium',
      location: 'Levent, İstanbul',
      type: 'commercial'
    },
    {
      id: '3',
      name: 'Fabrika İnşaatı',
      client: 'Endüstriyel Ürünler Ltd',
      status: 'in-progress',
      progress: 80,
      budget: 5000000,
      spent: 4000000,
      startDate: '2023-09-01',
      endDate: '2024-06-30',
      team: ['Murat Demir', 'Selin Çelik', 'Kemal Aksoy'],
      priority: 'high',
      location: 'Kocaeli',
      type: 'industrial'
    },
    {
      id: '4',
      name: 'Alışveriş Merkezi',
      client: 'Yatırım Grubu',
      status: 'on-hold',
      progress: 45,
      budget: 15000000,
      spent: 6750000,
      startDate: '2023-06-01',
      endDate: '2025-01-15',
      team: ['Fatma Şahin', 'Mustafa Kaya'],
      priority: 'low',
      location: 'Ankara',
      type: 'commercial'
    }
  ]

  const demoTasks: Task[] = [
    {
      id: '1',
      title: 'Temel kazı ve betonarme',
      project: 'Modern Villa Projesi',
      assignee: 'Ahmet Kaya',
      status: 'completed',
      priority: 'high',
      dueDate: '2024-02-28',
      estimatedHours: 120,
      actualHours: 115
    },
    {
      id: '2',
      title: 'Duvar örme ve sıva',
      project: 'Modern Villa Projesi',
      assignee: 'Ayşe Demir',
      status: 'in-progress',
      priority: 'medium',
      dueDate: '2024-04-15',
      estimatedHours: 80,
      actualHours: 65
    },
    {
      id: '3',
      title: 'Mekanik tesisat',
      project: 'Ofis Binası Restorasyon',
      assignee: 'Can Yılmaz',
      status: 'todo',
      priority: 'high',
      dueDate: '2024-05-30',
      estimatedHours: 200,
      actualHours: 0
    },
    {
      id: '4',
      title: 'Çatı kaplama',
      project: 'Fabrika İnşaatı',
      assignee: 'Murat Demir',
      status: 'review',
      priority: 'medium',
      dueDate: '2024-05-01',
      estimatedHours: 150,
      actualHours: 145
    }
  ]

  const demoTeam: TeamMember[] = [
    {
      id: '1',
      name: 'Ahmet Kaya',
      role: 'İnşaat Mühendisi',
      avatar: '/api/placeholder/40/40',
      status: 'busy',
      currentTask: 'Modern Villa Projesi'
    },
    {
      id: '2',
      name: 'Ayşe Demir',
      role: 'Mimar',
      avatar: '/api/placeholder/40/40',
      status: 'busy',
      currentTask: 'Modern Villa Projesi'
    },
    {
      id: '3',
      name: 'Mehmet Öz',
      role: 'Şantiye Şefi',
      avatar: '/api/placeholder/40/40',
      status: 'available',
      currentTask: ''
    },
    {
      id: '4',
      name: 'Zeynep Arslan',
      role: 'Proje Yöneticisi',
      avatar: '/api/placeholder/40/40',
      status: 'busy',
      currentTask: 'Ofis Binası Restorasyon'
    },
    {
      id: '5',
      name: 'Can Yılmaz',
      role: 'Mekanik Uzmanı',
      avatar: '/api/placeholder/40/40',
      status: 'available',
      currentTask: ''
    }
  ]

  useEffect(() => {
    setProjects(demoProjects)
    setTasks(demoTasks)
    setTeam(demoTeam)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      case 'planning': return 'bg-yellow-100 text-yellow-800'
      case 'on-hold': return 'bg-red-100 text-red-800'
      case 'todo': return 'bg-gray-100 text-gray-800'
      case 'review': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'in-progress': return <Clock className="w-4 h-4" />
      case 'on-hold': return <AlertCircle className="w-4 h-4" />
      default: return <Target className="w-4 h-4" />
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const totalBudget = projects.reduce((sum, project) => sum + project.budget, 0)
  const totalSpent = projects.reduce((sum, project) => sum + project.spent, 0)
  const activeProjects = projects.filter(p => p.status === 'in-progress').length
  const completedProjects = projects.filter(p => p.status === 'completed').length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-gradient">Proje Yönetimi</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Kapsamlı iş takip ve yönetim araçları
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Yeni Proje
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Toplam Bütçe</p>
                  <p className="text-2xl font-bold">₺{(totalBudget / 1000000).toFixed(1)}M</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Harcanan</p>
                  <p className="text-2xl font-bold">₺{(totalSpent / 1000000).toFixed(1)}M</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Aktif Projeler</p>
                  <p className="text-2xl font-bold">{activeProjects}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tamamlanan</p>
                  <p className="text-2xl font-bold">{completedProjects}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 max-w-2xl">
            <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
            <TabsTrigger value="projects">Projeler</TabsTrigger>
            <TabsTrigger value="tasks">Görevler</TabsTrigger>
            <TabsTrigger value="team">Takım</TabsTrigger>
            <TabsTrigger value="ar">3D/AR</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Charts and Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Proje Durumları</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['in-progress', 'planning', 'completed', 'on-hold'].map(status => {
                      const count = projects.filter(p => p.status === status).length
                      const percentage = projects.length > 0 ? (count / projects.length) * 100 : 0
                      return (
                        <div key={status} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium capitalize">{status}</span>
                            <span className="text-sm text-muted-foreground">{count} proje</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Bütçe Kullanımı</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Toplam Bütçe</span>
                      <span className="text-sm font-bold">₺{totalBudget.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Harcanan</span>
                      <span className="text-sm font-bold">₺{totalSpent.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Kalan</span>
                      <span className="text-sm font-bold text-green-600">₺{(totalBudget - totalSpent).toLocaleString()}</span>
                    </div>
                    <Progress value={(totalSpent / totalBudget) * 100} className="h-3" />
                    <p className="text-xs text-muted-foreground text-center">
                      %{((totalSpent / totalBudget) * 100).toFixed(1)} kullanıldı
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Projects */}
            <Card>
              <CardHeader>
                <CardTitle>Son Projeler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projects.slice(0, 3).map(project => (
                    <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{project.name}</h3>
                          <p className="text-sm text-muted-foreground">{project.client}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <Progress value={project.progress} className="w-20 h-2" />
                          <span className="text-sm font-medium">{project.progress}%</span>
                        </div>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            {/* Projects Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Proje ara..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Durum" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tümü</SelectItem>
                      <SelectItem value="planning">Planlama</SelectItem>
                      <SelectItem value="in-progress">Devam Ediyor</SelectItem>
                      <SelectItem value="completed">Tamamlandı</SelectItem>
                      <SelectItem value="on-hold">Beklemede</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Projects List */}
            <div className="grid gap-6">
              {filteredProjects.map(project => (
                <Card key={project.id} className="hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold mb-1">{project.name}</h3>
                        <p className="text-muted-foreground">{project.client} • {project.location}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(project.priority)}>
                          {project.priority}
                        </Badge>
                        <Badge className={getStatusColor(project.status)}>
                          {getStatusIcon(project.status)}
                          <span className="ml-1 capitalize">{project.status}</span>
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">İlerleme</span>
                          <span className="text-sm font-bold">{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Bütçe</span>
                          <span className="text-sm font-bold">₺{project.budget.toLocaleString()}</span>
                        </div>
                        <Progress value={(project.spent / project.budget) * 100} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          ₺{project.spent.toLocaleString()} harcandı
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Takvim</span>
                          <span className="text-sm font-bold">
                            {new Date(project.startDate).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Bitiş: {new Date(project.endDate).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-6">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {project.team.length} kişi
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <FileText className="w-4 h-4 mr-1" />
                          Detaylar
                        </Button>
                        <Button size="sm">
                          <Settings className="w-4 h-4 mr-1" />
                          Yönet
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {['todo', 'in-progress', 'review', 'completed'].map(status => (
                <Card key={status}>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium capitalize">
                      {status}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                    {tasks.filter(task => task.status === status).map(task => (
                      <div key={task.id} className="p-3 bg-muted rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-sm font-medium">{task.title}</h4>
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {task.project}
                        </p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{task.assignee}</span>
                          <span className="text-muted-foreground">
                            {new Date(task.dueDate).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {team.map(member => (
                <Card key={member.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <HardHat className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-2 h-2 rounded-full ${
                        member.status === 'available' ? 'bg-green-500' :
                        member.status === 'busy' ? 'bg-red-500' : 'bg-gray-500'
                      }`} />
                      <span className="text-sm text-muted-foreground capitalize">
                        {member.status}
                      </span>
                    </div>

                    {member.currentTask && (
                      <div className="p-2 bg-muted rounded text-xs">
                        <p className="font-medium mb-1">Mevcut Görev:</p>
                        <p className="text-muted-foreground">{member.currentTask}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-4">
                      <Button size="sm" variant="outline" className="flex-1">
                        <MessageSquare className="w-3 h-3 mr-1" />
                        Mesaj
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        Takvim
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="ar" className="space-y-6">
            <ARIntegration />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}