'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  User, 
  Building2, 
  Shield, 
  FileText, 
  Upload, 
  Camera,
  CheckCircle,
  Clock,
  AlertCircle,
  Star,
  Award,
  Zap,
  Eye,
  Lock,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  FileCheck,
  Fingerprint,
  Smartphone,
  IdCard,
  Stamp,
  Scale,
  Gavel,
  Users,
  TrendingUp
} from 'lucide-react'

interface VerificationStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  status: 'pending' | 'in-progress' | 'completed' | 'failed'
  required: boolean
}

interface Document {
  id: string
  name: string
  type: string
  required: boolean
  status: 'pending' | 'uploaded' | 'verifying' | 'approved' | 'rejected'
  file?: File
  uploadedAt?: string
  verifiedAt?: string
  rejectionReason?: string
}

interface VerificationData {
  userType: 'individual' | 'professional' | 'corporate'
  personalInfo: {
    fullName: string
    email: string
    phone: string
    birthDate: string
    nationality: string
    address: string
  }
  professionalInfo: {
    profession: string
    experience: string
    company?: string
    taxNumber?: string
    tradeRegistry?: string
    chamberMembership?: string
  }
  documents: Document[]
  verificationStatus: 'not_started' | 'in_progress' | 'pending_review' | 'approved' | 'rejected'
  riskScore: number
  complianceScore: number
}

export default function VerificationSystem() {
  const [activeStep, setActiveStep] = useState(1)
  const [verificationData, setVerificationData] = useState<VerificationData>({
    userType: 'individual',
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      birthDate: '',
      nationality: 'Türkiye',
      address: ''
    },
    professionalInfo: {
      profession: '',
      experience: '',
      company: '',
      taxNumber: '',
      tradeRegistry: '',
      chamberMembership: ''
    },
    documents: [],
    verificationStatus: 'not_started',
    riskScore: 0,
    complianceScore: 0
  })

  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const verificationSteps: VerificationStep[] = [
    {
      id: 'user-type',
      title: 'Hesap Türü Seçimi',
      description: 'Kullanıcı tipinizi belirleyin',
      icon: <User className="w-6 h-6" />,
      status: activeStep >= 1 ? 'completed' : 'pending',
      required: true
    },
    {
      id: 'personal-info',
      title: 'Kişisel Bilgiler',
      description: 'Temel kimlik bilgilerinizi girin',
      icon: <IdCard className="w-6 h-6" />,
      status: activeStep >= 2 ? 'completed' : 'pending',
      required: true
    },
    {
      id: 'professional-info',
      title: 'Profesyonel Bilgiler',
      description: 'Mesleki bilgilerinizi belirtin',
      icon: <Building2 className="w-6 h-6" />,
      status: activeStep >= 3 ? 'completed' : 'pending',
      required: verificationData.userType !== 'individual'
    },
    {
      id: 'document-upload',
      title: 'Belge Yükleme',
      description: 'Gerekli belgeleri yükleyin',
      icon: <FileText className="w-6 h-6" />,
      status: activeStep >= 4 ? 'completed' : 'pending',
      required: true
    },
    {
      id: 'identity-verification',
      title: 'Kimlik Doğrulama',
      description: 'Kimliğinizi doğrulayın',
      icon: <Fingerprint className="w-6 h-6" />,
      status: activeStep >= 5 ? 'completed' : 'pending',
      required: true
    },
    {
      id: 'review',
      title: 'İnceleme ve Onay',
      description: 'Başvurunuzu gözden geçirin',
      icon: <CheckCircle className="w-6 h-6" />,
      status: activeStep >= 6 ? 'in-progress' : 'pending',
      required: true
    }
  ]

  const documentTemplates = {
    individual: [
      { id: 'id-card', name: 'Kimlik Kartı', type: 'Kimlik', required: true },
      { id: 'address-proof', name: 'İkametgah Belgesi', type: 'Adres', required: true }
    ],
    professional: [
      { id: 'id-card', name: 'Kimlik Kartı', type: 'Kimlik', required: true },
      { id: 'profession-cert', name: 'Meslek Belgesi', type: 'Meslek', required: true },
      { id: 'tax-plate', name: 'Vergi Levhası', type: 'Vergi', required: true },
      { id: 'address-proof', name: 'İkametgah Belgesi', type: 'Adres', required: true }
    ],
    corporate: [
      { id: 'trade-registry', name: 'Ticaret Sicil Gazetesi', type: 'Şirket', required: true },
      { id: 'tax-plate', name: 'Vergi Levhası', type: 'Vergi', required: true },
      { id: 'signature-circular', name: 'İmza Sirküleri', type: 'Şirket', required: true },
      { id: 'activity-certificate', name: 'Faaliyet Belgesi', type: 'Şirket', required: true },
      { id: 'sgk-document', name: 'SGK İşveren Belgesi', type: 'Şirket', required: true }
    ]
  }

  useEffect(() => {
    // Belge listesini kullanıcı tipine göre güncelle
    const docs = documentTemplates[verificationData.userType] || documentTemplates.individual
    setVerificationData(prev => ({
      ...prev,
      documents: docs.map(doc => ({
        ...doc,
        status: 'pending' as const
      }))
    }))
  }, [verificationData.userType])

  const handleDocumentUpload = (documentId: string, file: File) => {
    setIsUploading(true)
    setUploadProgress(0)
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          
          // Update document status
          setVerificationData(prev => ({
            ...prev,
            documents: prev.documents.map(doc =>
              doc.id === documentId
                ? { ...doc, status: 'uploaded', file, uploadedAt: new Date().toISOString() }
                : doc
            )
          }))
          
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const startIdentityVerification = () => {
    // Simulate identity verification
    setVerificationData(prev => ({
      ...prev,
      verificationStatus: 'in_progress'
    }))
    
    setTimeout(() => {
      setVerificationData(prev => ({
        ...prev,
        verificationStatus: 'pending_review',
        riskScore: Math.floor(Math.random() * 30) + 70, // 70-100
        complianceScore: Math.floor(Math.random() * 20) + 80 // 80-100
      }))
      setActiveStep(6)
    }, 3000)
  }

  const getStepStatus = (stepId: string) => {
    const step = verificationSteps.find(s => s.id === stepId)
    return step?.status || 'pending'
  }

  const getDocumentStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'uploaded': return 'bg-blue-100 text-blue-800'
      case 'verifying': return 'bg-yellow-100 text-yellow-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-gradient">Profesyonel Doğrulama</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            KVKK ve KYB uyumlu kimlik doğrulama sistemi
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Progress Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Doğrulama Süreci
                </CardTitle>
                <CardDescription>
                  Adım adım profesyonel doğrulama
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {verificationSteps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      activeStep === index + 1 ? 'bg-primary/10' : 'hover:bg-muted'
                    }`}
                    onClick={() => setActiveStep(index + 1)}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.status === 'completed' ? 'bg-green-500 text-white' :
                      step.status === 'in-progress' ? 'bg-blue-500 text-white' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {step.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{step.title}</h3>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                    {step.status === 'completed' && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Hesap Türü Seçimi</CardTitle>
                  <CardDescription>
                    Lütfen kendinize en uygun hesap türünü seçin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4">
                    <Card 
                      className={`cursor-pointer transition-all border-2 ${
                        verificationData.userType === 'individual' 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setVerificationData(prev => ({ ...prev, userType: 'individual' }))}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-2">Bireysel Kullanıcı</h3>
                            <p className="text-sm text-muted-foreground mb-3">
                              Hizmet almak isteyen normal kullanıcılar için
                            </p>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="w-4 h-4" />
                              <span>5 dakikada doğrulama</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card 
                      className={`cursor-pointer transition-all border-2 ${
                        verificationData.userType === 'professional' 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setVerificationData(prev => ({ ...prev, userType: 'professional' }))}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-2">Profesyonel (Usta)</h3>
                            <p className="text-sm text-muted-foreground mb-3">
                              Bireysel esnaf ve serbest meslek sahipleri için
                            </p>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="w-4 h-4" />
                              <span>24-48 saatte doğrulama</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card 
                      className={`cursor-pointer transition-all border-2 ${
                        verificationData.userType === 'corporate' 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setVerificationData(prev => ({ ...prev, userType: 'corporate' }))}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <Scale className="w-6 h-6 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-2">Kurumsal Üye</h3>
                            <p className="text-sm text-muted-foreground mb-3">
                              Şirketler ve kurumsal firmalar için
                            </p>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="w-4 h-4" />
                              <span>3-7 günde doğrulama</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={() => setActiveStep(2)}
                    disabled={verificationData.userType === 'individual'}
                  >
                    Devam Et
                  </Button>
                </CardContent>
              </Card>
            )}

            {activeStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Kişisel Bilgiler</CardTitle>
                  <CardDescription>
                    Lütfen kimlik bilgilerinizi eksiksiz doldurun
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Ad Soyad</label>
                      <Input
                        placeholder="Adınızı soyadınızı girin"
                        value={verificationData.personalInfo.fullName}
                        onChange={(e) => setVerificationData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, fullName: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">E-posta</label>
                      <Input
                        type="email"
                        placeholder="E-posta adresiniz"
                        value={verificationData.personalInfo.email}
                        onChange={(e) => setVerificationData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, email: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Telefon</label>
                      <Input
                        placeholder="+90 5XX XXX XX XX"
                        value={verificationData.personalInfo.phone}
                        onChange={(e) => setVerificationData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, phone: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Doğum Tarihi</label>
                      <Input
                        type="date"
                        value={verificationData.personalInfo.birthDate}
                        onChange={(e) => setVerificationData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, birthDate: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Uyruk</label>
                      <Select value={verificationData.personalInfo.nationality}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Türkiye">Türkiye</SelectItem>
                          <SelectItem value="Diğer">Diğer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium mb-2 block">Adres</label>
                      <Input
                        placeholder="Tam adresinizi girin"
                        value={verificationData.personalInfo.address}
                        onChange={(e) => setVerificationData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, address: e.target.value }
                        }))}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveStep(1)}
                    >
                      Geri
                    </Button>
                    <Button 
                      className="flex-1"
                      onClick={() => setActiveStep(3)}
                      disabled={!verificationData.personalInfo.fullName || !verificationData.personalInfo.email}
                    >
                      Devam Et
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeStep === 3 && verificationData.userType !== 'individual' && (
              <Card>
                <CardHeader>
                  <CardTitle>Profesyonel Bilgiler</CardTitle>
                  <CardDescription>
                    Mesleki bilgilerinizi ve şirket detaylarınızı girin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Meslek</label>
                      <Select 
                        value={verificationData.professionalInfo.profession}
                        onValueChange={(value) => setVerificationData(prev => ({
                          ...prev,
                          professionalInfo: { ...prev.professionalInfo, profession: value }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Mesleğinizi seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mimar">Mimar</SelectItem>
                          <SelectItem value="insaat-muhendis">İnşaat Mühendisi</SelectItem>
                          <SelectItem value="usta">Usta (Boyacı, Marangoz vb.)</SelectItem>
                          <SelectItem value="elektrikci">Elektrikçi</SelectItem>
                          <SelectItem value="tesisatci">Tesisatçı</SelectItem>
                          <SelectItem value="diger">Diğer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Deneyim</label>
                      <Select 
                        value={verificationData.professionalInfo.experience}
                        onValueChange={(value) => setVerificationData(prev => ({
                          ...prev,
                          professionalInfo: { ...prev.professionalInfo, experience: value }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Deneyim süreniz" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0-2">0-2 yıl</SelectItem>
                          <SelectItem value="3-5">3-5 yıl</SelectItem>
                          <SelectItem value="6-10">6-10 yıl</SelectItem>
                          <SelectItem value="10+">10+ yıl</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {verificationData.userType === 'corporate' && (
                      <>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Şirket Adı</label>
                          <Input
                            placeholder="Şirket ünvanı"
                            value={verificationData.professionalInfo.company}
                            onChange={(e) => setVerificationData(prev => ({
                              ...prev,
                              professionalInfo: { ...prev.professionalInfo, company: e.target.value }
                            }))}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Vergi Numarası</label>
                          <Input
                            placeholder="Vergi numarası"
                            value={verificationData.professionalInfo.taxNumber}
                            onChange={(e) => setVerificationData(prev => ({
                              ...prev,
                              professionalInfo: { ...prev.professionalInfo, taxNumber: e.target.value }
                            }))}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Ticaret Sicil No</label>
                          <Input
                            placeholder="Ticaret sicil numarası"
                            value={verificationData.professionalInfo.tradeRegistry}
                            onChange={(e) => setVerificationData(prev => ({
                              ...prev,
                              professionalInfo: { ...prev.professionalInfo, tradeRegistry: e.target.value }
                            }))}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Meslek Odası</label>
                          <Input
                            placeholder="Meslek odası üyelik no"
                            value={verificationData.professionalInfo.chamberMembership}
                            onChange={(e) => setVerificationData(prev => ({
                              ...prev,
                              professionalInfo: { ...prev.professionalInfo, chamberMembership: e.target.value }
                            }))}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveStep(2)}
                    >
                      Geri
                    </Button>
                    <Button 
                      className="flex-1"
                      onClick={() => setActiveStep(4)}
                      disabled={!verificationData.professionalInfo.profession}
                    >
                      Devam Et
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle>Belge Yükleme</CardTitle>
                  <CardDescription>
                    Gerekli belgeleri yükleyin. Tüm belgeler KVKK uyumlu şekilde şifrelenir.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {verificationData.documents.map((doc) => (
                      <Card key={doc.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-muted-foreground" />
                              <div>
                                <h4 className="font-medium">{doc.name}</h4>
                                <p className="text-sm text-muted-foreground">{doc.type}</p>
                              </div>
                            </div>
                            <Badge className={getDocumentStatusColor(doc.status)}>
                              {doc.status === 'pending' && 'Bekliyor'}
                              {doc.status === 'uploaded' && 'Yüklendi'}
                              {doc.status === 'verifying' && 'İnceleniyor'}
                              {doc.status === 'approved' && 'Onaylandı'}
                              {doc.status === 'rejected' && 'Reddedildi'}
                            </Badge>
                          </div>

                          {doc.status === 'pending' && (
                            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                              <div className="text-center">
                                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground mb-2">
                                  Belgeyi yüklemek için tıklayın
                                </p>
                                <input
                                  type="file"
                                  className="hidden"
                                  id={`file-${doc.id}`}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) handleDocumentUpload(doc.id, file)
                                  }}
                                />
                                <Button 
                                  size="sm"
                                  onClick={() => document.getElementById(`file-${doc.id}`)?.click()}
                                >
                                  Dosya Seç
                                </Button>
                              </div>
                            </div>
                          )}

                          {doc.status === 'uploaded' && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                              <div className="flex items-center gap-2 text-green-800">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-sm">Belge başarıyla yüklendi</span>
                              </div>
                              <p className="text-xs text-green-600 mt-1">
                                Yüklendi: {new Date(doc.uploadedAt!).toLocaleString('tr-TR')}
                              </p>
                            </div>
                          )}

                          {doc.status === 'verifying' && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                              <div className="flex items-center gap-2 text-yellow-800">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm">Belge inceleniyor...</span>
                              </div>
                              <Progress value={75} className="h-2 mt-2" />
                            </div>
                          )}

                          {doc.status === 'rejected' && doc.rejectionReason && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                              <div className="flex items-center gap-2 text-red-800">
                                <AlertCircle className="w-4 h-4" />
                                <span className="text-sm">Reddedildi: {doc.rejectionReason}</span>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {isUploading && (
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Upload className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Belge yükleniyor...</p>
                            <Progress value={uploadProgress} className="h-2 mt-1" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="flex items-center gap-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveStep(3)}
                    >
                      Geri
                    </Button>
                    <Button 
                      className="flex-1"
                      onClick={() => setActiveStep(5)}
                      disabled={!verificationData.documents.every(doc => doc.status === 'uploaded')}
                    >
                      Devam Et
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeStep === 5 && (
              <Card>
                <CardHeader>
                  <CardTitle>Kimlik Doğrulama</CardTitle>
                  <CardDescription>
                    Kimliğinizi doğrulamak için lütfen aşağıdaki adımları takip edin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Fingerprint className="w-10 h-10 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Canlılık Doğrulaması</h3>
                    <p className="text-muted-foreground mb-6">
                      Yüzünüzü tarayıcıya göstererek kimliğinizi doğrulayın
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-2 border-dashed">
                      <CardContent className="p-6 text-center">
                        <Camera className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                        <h4 className="font-medium mb-2">Selfie Çek</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Yüzünüz net görünecek şekilde selfie çekin
                        </p>
                        <Button size="sm">Kamerayı Aç</Button>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-dashed">
                      <CardContent className="p-6 text-center">
                        <IdCard className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                        <h4 className="font-medium mb-2">Kimlik Kartı</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Kimlik kartınızın ön yüzünü çekin
                        </p>
                        <Button size="sm">Kamerayı Aç</Button>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900 mb-1">Güvenlik Bilgisi</h4>
                        <p className="text-sm text-blue-700">
                          Biyometrik verileriniz KVKK uyumlu olarak şifrelenir ve sadece kimlik doğrulama için kullanılır.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveStep(4)}
                    >
                      Geri
                    </Button>
                    <Button 
                      className="flex-1"
                      onClick={startIdentityVerification}
                    >
                      Doğrulamayı Başlat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeStep === 6 && (
              <Card>
                <CardHeader>
                  <CardTitle>Başvuru İnceleme</CardTitle>
                  <CardDescription>
                    Başvurunuz inceleniyor ve doğrulanıyor
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {verificationData.verificationStatus === 'in_progress' && (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Doğrulama Yapılıyor</h3>
                      <p className="text-muted-foreground mb-4">
                        Lütfen bekleyin, kimliğiniz doğrulanıyor...
                      </p>
                      <div className="max-w-md mx-auto">
                        <Progress value={65} className="h-2" />
                      </div>
                    </div>
                  )}

                  {verificationData.verificationStatus === 'pending_review' && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Gavel className="w-8 h-8 text-yellow-600" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Manuel İncelemede</h3>
                        <p className="text-muted-foreground mb-4">
                          Başvurunuz uzmanlarımız tarafından inceleniyor
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-green-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">Risk Skoru</p>
                                <p className="text-lg font-bold text-green-600">{verificationData.riskScore}/100</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Shield className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">Uyum Skoru</p>
                                <p className="text-lg font-bold text-blue-600">{verificationData.complianceScore}/100</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <Card>
                        <CardContent className="p-4">
                          <h4 className="font-medium mb-3">Beklenen Süre</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Normal Kullanıcı:</span>
                              <span className="font-medium">5 dakika</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Profesyonel:</span>
                              <span className="font-medium">24-48 saat</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Kurumsal:</span>
                              <span className="font-medium">3-7 gün</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-blue-900 mb-1">Bildirim</h4>
                            <p className="text-sm text-blue-700">
                              Doğrulama tamamlandığında e-posta ile bilgilendirileceksiniz.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {verificationData.verificationStatus === 'approved' && (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Doğrulama Başarılı!</h3>
                      <p className="text-muted-foreground mb-4">
                        Tebrikler! Artık doğrulanmış profesyonel üyesiniz.
                      </p>
                      <div className="flex items-center justify-center gap-4">
                        <Badge className="bg-green-100 text-green-800">
                          <Award className="w-3 h-3 mr-1" />
                          Doğrulanmış Profesyonel
                        </Badge>
                        <Badge className="bg-blue-100 text-blue-800">
                          <Star className="w-3 h-3 mr-1" />
                          Güvenilir Üye
                        </Badge>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <Button variant="outline">
                      Ana Sayfaya Dön
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}