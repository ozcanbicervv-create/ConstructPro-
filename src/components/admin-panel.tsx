'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  Shield, 
  Users, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Eye,
  Search,
  Filter,
  TrendingUp,
  BarChart3,
  Activity,
  Fingerprint,
  Scale,
  Gavel,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  Star,
  Award,
  Zap,
  Download,
  Upload,
  RefreshCw,
  MoreHorizontal,
  UserCheck,
  UserX,
  FileCheck,
  FileX
} from 'lucide-react'

interface VerificationRequest {
  id: string
  userId: string
  userName: string
  userEmail: string
  userPhone: string
  userType: 'individual' | 'professional' | 'corporate'
  profession?: string
  company?: string
  submittedAt: string
  status: 'pending' | 'in_review' | 'approved' | 'rejected'
  riskScore: number
  complianceScore: number
  documents: VerificationDocument[]
  reviewer?: string
  reviewedAt?: string
  rejectionReason?: string
  notes?: string
}

interface VerificationDocument {
  id: string
  name: string
  type: string
  status: 'pending' | 'approved' | 'rejected'
  uploadedAt: string
  reviewedAt?: string
  rejectionReason?: string
  fileUrl?: string
}

interface AdminStats {
  totalRequests: number
  pendingRequests: number
  approvedRequests: number
  rejectedRequests: number
  averageProcessingTime: number
  highRiskCases: number
  complianceRate: number
}

export default function AdminPanel() {
  const [requests, setRequests] = useState<VerificationRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null)
  const [stats, setStats] = useState<AdminStats>({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    averageProcessingTime: 0,
    highRiskCases: 0,
    complianceRate: 0
  })
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterUserType, setFilterUserType] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('requests')

  // Demo veri
  const demoRequests: VerificationRequest[] = [
    {
      id: '1',
      userId: 'user1',
      userName: 'Ahmet Yılmaz',
      userEmail: 'ahmet@example.com',
      userPhone: '+90 555 123 4567',
      userType: 'professional',
      profession: 'İnşaat Mühendisi',
      submittedAt: '2024-03-15T10:30:00',
      status: 'pending',
      riskScore: 25,
      complianceScore: 85,
      documents: [
        {
          id: 'doc1',
          name: 'Kimlik Kartı',
          type: 'Kimlik',
          status: 'approved',
          uploadedAt: '2024-03-15T10:30:00'
        },
        {
          id: 'doc2',
          name: 'Vergi Levhası',
          type: 'Vergi',
          status: 'pending',
          uploadedAt: '2024-03-15T10:30:00'
        }
      ]
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'Mehmet Kaya',
      userEmail: 'mehmet@example.com',
      userPhone: '+90 555 987 6543',
      userType: 'corporate',
      company: 'Kaya İnşaat Ltd.',
      profession: 'Müteahhit',
      submittedAt: '2024-03-14T14:20:00',
      status: 'in_review',
      riskScore: 45,
      complianceScore: 72,
      documents: [
        {
          id: 'doc3',
          name: 'Ticaret Sicil Gazetesi',
          type: 'Şirket',
          status: 'approved',
          uploadedAt: '2024-03-14T14:20:00'
        },
        {
          id: 'doc4',
          name: 'İmza Sirküleri',
          type: 'Şirket',
          status: 'rejected',
          uploadedAt: '2024-03-14T14:20:00',
          rejectionReason: 'Belge net değil'
        }
      ],
      reviewer: 'Admin 1',
      notes: 'Şirket belgeleri kontrol ediliyor, imza sirküleri reddedildi.'
    },
    {
      id: '3',
      userId: 'user3',
      userName: 'Ayşe Demir',
      userEmail: 'ayse@example.com',
      userPhone: '+90 555 456 7890',
      userType: 'professional',
      profession: 'Mimar',
      submittedAt: '2024-03-13T09:15:00',
      status: 'approved',
      riskScore: 15,
      complianceScore: 92,
      documents: [
        {
          id: 'doc5',
          name: 'Kimlik Kartı',
          type: 'Kimlik',
          status: 'approved',
          uploadedAt: '2024-03-13T09:15:00'
        },
        {
          id: 'doc6',
          name: 'Meslek Belgesi',
          type: 'Meslek',
          status: 'approved',
          uploadedAt: '2024-03-13T09:15:00'
        }
      ],
      reviewer: 'Admin 2',
      reviewedAt: '2024-03-14T16:30:00'
    }
  ]

  useEffect(() => {
    setRequests(demoRequests)
    setStats({
      totalRequests: demoRequests.length,
      pendingRequests: demoRequests.filter(r => r.status === 'pending').length,
      approvedRequests: demoRequests.filter(r => r.status === 'approved').length,
      rejectedRequests: demoRequests.filter(r => r.status === 'rejected').length,
      averageProcessingTime: 28.5, // saat
      highRiskCases: demoRequests.filter(r => r.riskScore > 40).length,
      complianceRate: 83
    })
  }, [])

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.profession?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.company?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus
    const matchesUserType = filterUserType === 'all' || request.userType === filterUserType
    return matchesSearch && matchesStatus && matchesUserType
  })

  const handleApprove = (requestId: string) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId 
        ? { ...req, status: 'approved' as const, reviewer: 'Admin', reviewedAt: new Date().toISOString() }
        : req
    ))
  }

  const handleReject = (requestId: string, reason: string) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId 
        ? { ...req, status: 'rejected' as const, rejectionReason: reason, reviewer: 'Admin', reviewedAt: new Date().toISOString() }
        : req
    ))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'in_review': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  const getRiskColor = (score: number) => {
    if (score < 20) return 'text-green-600'
    if (score < 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getComplianceColor = (score: number) => {
    if (score > 80) return 'text-green-600'
    if (score > 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-gradient">Admin Paneli</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              KYC/KYB doğrulama yönetim sistemi
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Rapor İndir
            </Button>
            <Button>
              <RefreshCw className="w-4 h-4 mr-2" />
              Yenile
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Toplam Başvuru</p>
                  <p className="text-2xl font-bold">{stats.totalRequests}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Bekleyen</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingRequests}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Onaylanan</p>
                  <p className="text-2xl font-bold text-green-600">{stats.approvedRequests}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Yüksek Risk</p>
                  <p className="text-2xl font-bold text-red-600">{stats.highRiskCases}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="requests">Başvurular</TabsTrigger>
            <TabsTrigger value="analytics">Analitik</TabsTrigger>
            <TabsTrigger value="settings">Ayarlar</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Kullanıcı ara..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Durum" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tümü</SelectItem>
                      <SelectItem value="pending">Bekleyen</SelectItem>
                      <SelectItem value="in_review">İnceleniyor</SelectItem>
                      <SelectItem value="approved">Onaylandı</SelectItem>
                      <SelectItem value="rejected">Reddedildi</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterUserType} onValueChange={setFilterUserType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kullanıcı Tipi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tümü</SelectItem>
                      <SelectItem value="individual">Bireysel</SelectItem>
                      <SelectItem value="professional">Profesyonel</SelectItem>
                      <SelectItem value="corporate">Kurumsal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Requests List */}
            <div className="grid gap-4">
              {filteredRequests.map((request) => (
                <Card key={request.id} className="hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{request.userName}</h3>
                          <p className="text-sm text-muted-foreground">{request.userEmail}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {request.userPhone}
                            </span>
                            {request.profession && (
                              <span className="flex items-center gap-1">
                                <Star className="w-3 h-3" />
                                {request.profession}
                              </span>
                            )}
                            {request.company && (
                              <span className="flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                {request.company}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(request.status)}>
                          {request.status === 'pending' && 'Bekleyen'}
                          {request.status === 'in_review' && 'İnceleniyor'}
                          {request.status === 'approved' && 'Onaylandı'}
                          {request.status === 'rejected' && 'Reddedildi'}
                        </Badge>
                        
                        <Badge variant="outline">
                          {request.userType === 'individual' && 'Bireysel'}
                          {request.userType === 'professional' && 'Profesyonel'}
                          {request.userType === 'corporate' && 'Kurumsal'}
                        </Badge>
                        
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Risk:</span>
                            <span className={`text-sm font-bold ${getRiskColor(request.riskScore)}`}>
                              {request.riskScore}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Uyum:</span>
                            <span className={`text-sm font-bold ${getComplianceColor(request.complianceScore)}`}>
                              {request.complianceScore}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(request.submittedAt).toLocaleDateString('tr-TR')}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {request.documents.length} belge
                        </span>
                        {request.reviewer && (
                          <span className="flex items-center gap-1">
                            <UserCheck className="w-3 h-3" />
                            {request.reviewer}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedRequest(request)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Detay
                        </Button>
                        
                        {request.status === 'pending' || request.status === 'in_review' ? (
                          <>
                            <Button 
                              size="sm" 
                              onClick={() => handleApprove(request.id)}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Onayla
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleReject(request.id, 'Belgeler yetersiz')}
                            >
                              <UserX className="w-4 h-4 mr-1" />
                              Reddet
                            </Button>
                          </>
                        ) : (
                          <Button size="sm" variant="outline">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Doğrulama İstatistikleri</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Ortalama İşlem Süresi</span>
                      <span className="font-bold">{stats.averageProcessingTime} saat</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Uyum Oranı</span>
                      <span className="font-bold text-green-600">{stats.complianceRate}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Onay Oranı</span>
                      <span className="font-bold">
                        {((stats.approvedRequests / stats.totalRequests) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Red Oranı</span>
                      <span className="font-bold text-red-600">
                        {((stats.rejectedRequests / stats.totalRequests) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risk Dağılımı</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Düşük Risk (0-20)</span>
                      <span className="font-bold text-green-600">
                        {requests.filter(r => r.riskScore <= 20).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Orta Risk (21-40)</span>
                      <span className="font-bold text-yellow-600">
                        {requests.filter(r => r.riskScore > 20 && r.riskScore <= 40).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Yüksek Risk (41+)</span>
                      <span className="font-bold text-red-600">
                        {requests.filter(r => r.riskScore > 40).length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sistem Ayarları</CardTitle>
                <CardDescription>
                  Doğrulama sistemi ayarlarını yapılandırın
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-3">Risk Eşikleri</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Düşük Risk Maksimum</label>
                        <Input type="number" defaultValue="20" />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Orta Risk Maksimum</label>
                        <Input type="number" defaultValue="40" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Otomatik Kurallar</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Otomatik Onay Eşiği</span>
                        <Input type="number" defaultValue="95" className="w-20" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Otomatik Red Eşiği</span>
                        <Input type="number" defaultValue="15" className="w-20" />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Bildirim Ayarları</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Yeni Başvuru Bildirimi</span>
                      <input type="checkbox" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Yüksek Risk Uyarısı</span>
                      <input type="checkbox" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Günlük Rapor</span>
                      <input type="checkbox" defaultChecked />
                    </div>
                  </div>
                </div>

                <Button>
                  Ayarları Kaydet
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}