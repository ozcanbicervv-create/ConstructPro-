'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Users, 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  Building2,
  Wrench,
  HardHat,
  Briefcase,
  MessageSquare,
  Plus,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  TrendingUp,
  Award,
  Phone,
  Mail,
  Link,
  FileText,
  Eye,
  Heart,
  Share2
} from 'lucide-react'

interface Professional {
  id: string
  name: string
  role: string
  company: string
  location: string
  rating: number
  reviews: number
  completedProjects: number
  experience: number
  specialties: string[]
  availability: 'available' | 'busy' | 'offline'
  hourlyRate?: number
  avatar: string
  verified: boolean
  joinedDate: string
  lastActive: string
}

interface Job {
  id: string
  title: string
  company: string
  location: string
  type: 'full-time' | 'part-time' | 'contract' | 'project'
  salary: string
  posted: string
  deadline: string
  description: string
  requirements: string[]
  applicants: number
  status: 'open' | 'closed'
}

interface Project {
  id: string
  title: string
  client: string
  budget: string
  duration: string
  location: string
  category: string
  posted: string
  proposals: number
  status: 'open' | 'in-progress' | 'completed'
  skills: string[]
}

export default function ProfessionalNetwork() {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterLocation, setFilterLocation] = useState('all')
  const [activeTab, setActiveTab] = useState('professionals')

  // Demo veri
  const demoProfessionals: Professional[] = [
    {
      id: '1',
      name: 'Ahmet Yılmaz',
      role: 'İnşaat Mühendisi',
      company: 'Yılmaz Mühendislik',
      location: 'İstanbul',
      rating: 4.8,
      reviews: 127,
      completedProjects: 45,
      experience: 12,
      specialties: ['Yapı Tasarımı', 'Proje Yönetimi', 'Statik Analiz'],
      availability: 'available',
      hourlyRate: 350,
      avatar: '/api/placeholder/80/80',
      verified: true,
      joinedDate: '2020-03-15',
      lastActive: '2 saat önce'
    },
    {
      id: '2',
      name: 'Ayşe Demir',
      role: 'Mimar',
      company: 'Demir Mimarlık',
      location: 'Ankara',
      rating: 4.9,
      reviews: 89,
      completedProjects: 32,
      experience: 8,
      specialties: ['Konut Tasarımı', 'İç Mimarlık', '3D Görselleştirme'],
      availability: 'busy',
      hourlyRate: 280,
      avatar: '/api/placeholder/80/80',
      verified: true,
      joinedDate: '2021-07-20',
      lastActive: '1 gün önce'
    },
    {
      id: '3',
      name: 'Mehmet Kaya',
      role: 'Şantiye Şefi',
      company: 'Kaya İnşaat',
      location: 'İzmir',
      rating: 4.7,
      reviews: 156,
      completedProjects: 67,
      experience: 15,
      specialties: ['Şantiye Yönetimi', 'Güvenlik', 'Kalite Kontrol'],
      availability: 'available',
      hourlyRate: 200,
      avatar: '/api/placeholder/80/80',
      verified: true,
      joinedDate: '2019-11-10',
      lastActive: '30 dakika önce'
    },
    {
      id: '4',
      name: 'Zeynep Arslan',
      role: 'Proje Yöneticisi',
      company: 'Arslan Proje',
      location: 'Bursa',
      rating: 4.6,
      reviews: 73,
      completedProjects: 28,
      experience: 10,
      specialties: ['Proje Planlama', 'Bütçe Yönetimi', 'Takım Liderliği'],
      availability: 'available',
      hourlyRate: 400,
      avatar: '/api/placeholder/80/80',
      verified: true,
      joinedDate: '2020-09-05',
      lastActive: '3 saat önce'
    }
  ]

  const demoJobs: Job[] = [
    {
      id: '1',
      title: 'Kıdemli İnşaat Mühendisi',
      company: 'Teknik Yapı AŞ',
      location: 'İstanbul',
      type: 'full-time',
      salary: '₺25,000 - ₺35,000',
      posted: '2 gün önce',
      deadline: '2024-04-15',
      description: 'Büyük ölçekli konut projelerinde deneyimli inşaat mühendisi arıyoruz.',
      requirements: ['Minimum 5 yıl deneyim', 'Autocad bilgisi', 'Ekip yönetimi'],
      applicants: 12,
      status: 'open'
    },
    {
      id: '2',
      title: 'Proje Mimar',
      company: 'Modern Mimarlık',
      location: 'Ankara',
      type: 'contract',
      salary: 'Proje bazlı',
      posted: '1 hafta önce',
      deadline: '2024-04-30',
      description: 'Ticari bina projeleri için yetenekli mimar arıyoruz.',
      requirements: ['3D tasarım', 'Revit bilgisi', 'Sunum becerileri'],
      applicants: 8,
      status: 'open'
    }
  ]

  const demoProjects: Project[] = [
    {
      id: '1',
      title: 'Villa İnşaatı',
      client: 'Özel Müşteri',
      budget: '₺2,500,000',
      duration: '6 ay',
      location: 'Muğla',
      category: 'Konut',
      posted: '3 gün önce',
      proposals: 5,
      status: 'open',
      skills: ['İnşaat Mühendisliği', 'Mimarlık', 'Proje Yönetimi']
    },
    {
      id: '2',
      title: 'Ofis Restorasyonu',
      client: 'Tech Solutions',
      budget: '₺800,000',
      duration: '3 ay',
      location: 'İstanbul',
      category: 'Ticari',
      posted: '1 hafta önce',
      proposals: 8,
      status: 'open',
      skills: ['Restorasyon', 'İç Mimarlık', 'Tadilat']
    }
  ]

  useEffect(() => {
    setProfessionals(demoProfessionals)
    setJobs(demoJobs)
    setProjects(demoProjects)
  }, [])

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-800'
      case 'busy': return 'bg-yellow-100 text-yellow-800'
      case 'offline': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getJobTypeColor = (type: string) => {
    switch (type) {
      case 'full-time': return 'bg-blue-100 text-blue-800'
      case 'part-time': return 'bg-purple-100 text-purple-800'
      case 'contract': return 'bg-orange-100 text-orange-800'
      case 'project': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredProfessionals = professionals.filter(professional => {
    const matchesSearch = professional.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         professional.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         professional.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         professional.specialties.some(specialty => 
                           specialty.toLowerCase().includes(searchTerm.toLowerCase())
                         )
    const matchesRole = filterRole === 'all' || professional.role === filterRole
    const matchesLocation = filterLocation === 'all' || professional.location === filterLocation
    return matchesSearch && matchesRole && matchesLocation
  })

  const roles = ['all', ...new Set(professionals.map(p => p.role))]
  const locations = ['all', ...new Set(professionals.map(p => p.location))]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-gradient">Profesyonel Ağ</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Sektör profesyonelleri arası iş birliği ve iş eşleştirme
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Toplam Üye</p>
                  <p className="text-2xl font-bold">{professionals.length}+</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Açık İşler</p>
                  <p className="text-2xl font-bold">{jobs.length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Proje Teklifleri</p>
                  <p className="text-2xl font-bold">{projects.length}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tamamlanan İş</p>
                  <p className="text-2xl font-bold">
                    {professionals.reduce((sum, p) => sum + p.completedProjects, 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="professionals">Profesyoneller</TabsTrigger>
            <TabsTrigger value="jobs">İş İlanları</TabsTrigger>
            <TabsTrigger value="projects">Projeler</TabsTrigger>
          </TabsList>

          <TabsContent value="professionals" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Profesyonel ara..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Rol" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(role => (
                        <SelectItem key={role} value={role}>
                          {role === 'all' ? 'Tüm Roller' : role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterLocation} onValueChange={setFilterLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Konum" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map(location => (
                        <SelectItem key={location} value={location}>
                          {location === 'all' ? 'Tüm Konumlar' : location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Professionals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProfessionals.map(professional => (
                <Card key={professional.id} className="hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={professional.avatar} />
                        <AvatarFallback>
                          {professional.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{professional.name}</h3>
                          {professional.verified && (
                            <CheckCircle className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{professional.role}</p>
                        <p className="text-sm text-muted-foreground">{professional.company}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{professional.rating}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">({professional.reviews} değerlendirme)</span>
                      <Badge className={getAvailabilityColor(professional.availability)}>
                        {professional.availability}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Deneyim</p>
                        <p className="font-medium">{professional.experience} yıl</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Tamamlanan Proje</p>
                        <p className="font-medium">{professional.completedProjects}</p>
                      </div>
                      {professional.hourlyRate && (
                        <div>
                          <p className="text-muted-foreground">Saatlik Ücret</p>
                          <p className="font-medium">₺{professional.hourlyRate}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-muted-foreground">Konum</p>
                        <p className="font-medium">{professional.location}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">Uzmanlık Alanları:</p>
                      <div className="flex flex-wrap gap-1">
                        {professional.specialties.map((specialty, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button size="sm" className="flex-1">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Mesaj
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <div className="grid gap-6">
              {jobs.map(job => (
                <Card key={job.id} className="hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            {job.company}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {job.posted}
                          </div>
                        </div>
                        <Badge className={getJobTypeColor(job.type)}>
                          {job.type}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary mb-1">{job.salary}</p>
                        <p className="text-sm text-muted-foreground">
                          Son başvuru: {new Date(job.deadline).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    </div>

                    <p className="text-muted-foreground mb-4">{job.description}</p>

                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">Gereksinimler:</p>
                      <div className="flex flex-wrap gap-2">
                        {job.requirements.map((requirement, index) => (
                          <Badge key={index} variant="outline">
                            {requirement}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {job.applicants} başvuru
                        </div>
                        <Badge variant={job.status === 'open' ? 'default' : 'secondary'}>
                          {job.status === 'open' ? 'Açık' : 'Kapalı'}
                        </Badge>
                      </div>
                      <Button>
                        <Briefcase className="w-4 h-4 mr-2" />
                        Başvur
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <div className="grid gap-6">
              {projects.map(project => (
                <Card key={project.id} className="hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {project.client}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {project.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {project.posted}
                          </div>
                        </div>
                        <Badge variant="outline">{project.category}</Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary mb-1">{project.budget}</p>
                        <p className="text-sm text-muted-foreground">{project.duration}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">Gerekli Beceriler:</p>
                      <div className="flex flex-wrap gap-2">
                        {project.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {project.proposals} teklif
                        </div>
                        <Badge variant={project.status === 'open' ? 'default' : 'secondary'}>
                          {project.status === 'open' ? 'Açık' : 'Devam Ediyor'}
                        </Badge>
                      </div>
                      <Button>
                        <DollarSign className="w-4 h-4 mr-2" />
                        Teklif Ver
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}