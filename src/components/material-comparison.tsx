'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  MapPin, 
  Filter, 
  SortAsc, 
  Star, 
  Truck, 
  Clock,
  Building2,
  Package,
  Percent,
  Navigation,
  RefreshCw,
  Heart,
  Share2
} from 'lucide-react'

interface Material {
  id: string
  name: string
  category: string
  brand: string
  store: string
  price: number
  originalPrice?: number
  discount?: number
  distance: number
  rating: number
  stock: boolean
  deliveryTime: string
  features: string[]
  image?: string
}

interface Store {
  id: string
  name: string
  distance: number
  rating: number
  phone: string
  address: string
  open: boolean
}

export default function MaterialComparison() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('price')
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [loading, setLoading] = useState(false)
  const [materials, setMaterials] = useState<Material[]>([])
  const [stores, setStores] = useState<Store[]>([])

  const categories = [
    { value: 'all', label: 'Tüm Kategoriler' },
    { value: 'cement', label: 'Çimento' },
    { value: 'steel', label: 'Demir' },
    { value: 'paint', label: 'Boya' },
    { value: 'tiles', label: 'Fayans' },
    { value: 'insulation', label: 'Yalıtım' },
    { value: 'plumbing', label: 'Tesisat' },
    { value: 'electrical', label: 'Elektrik' }
  ]

  const sortOptions = [
    { value: 'price', label: 'Fiyat (Düşükten Yükseğe)' },
    { value: 'price-desc', label: 'Fiyat (Yüksekten Düşüğe)' },
    { value: 'distance', label: 'Mesafe (Yakından Uzağa)' },
    { value: 'rating', label: 'Değerlendirme (Yüksekten Düşüğe)' },
    { value: 'discount', label: 'İndirim (Yüksekten Düşüğe)' }
  ]

  // Demo veri
  const demoMaterials: Material[] = [
    {
      id: '1',
      name: 'Çimento 50kg Portland',
      category: 'cement',
      brand: 'Çimsa',
      store: 'Koçtaş',
      price: 185,
      originalPrice: 195,
      discount: 5,
      distance: 2.3,
      rating: 4.8,
      stock: true,
      deliveryTime: '2-4 saat',
      features: ['Yüksek dayanım', 'Hızlı priz', 'Standart kalite'],
      image: '/api/placeholder/100/100'
    },
    {
      id: '2',
      name: 'Çimento 50kg Portland',
      category: 'cement',
      brand: 'Çimsa',
      store: 'Migros',
      price: 195,
      distance: 2.5,
      rating: 4.6,
      stock: true,
      deliveryTime: '3-5 saat',
      features: ['Yüksek dayanım', 'Hızlı priz'],
      image: '/api/placeholder/100/100'
    },
    {
      id: '3',
      name: 'Çimento 50kg Portland',
      category: 'cement',
      brand: 'Çimsa',
      store: 'Tekzen',
      price: 205,
      distance: 3.8,
      rating: 4.5,
      stock: true,
      deliveryTime: '4-6 saat',
      features: ['Yüksek dayanım', 'Ekonomik'],
      image: '/api/placeholder/100/100'
    },
    {
      id: '4',
      name: 'Demir İnşaat Çelik 12mm',
      category: 'steel',
      brand: 'İsdemir',
      store: 'Koçtaş',
      price: 4500,
      distance: 2.3,
      rating: 4.7,
      stock: true,
      deliveryTime: '1-2 gün',
      features: ['S420 kalite', 'Standart uzunluk', 'Galvanizli'],
      image: '/api/placeholder/100/100'
    },
    {
      id: '5',
      name: 'Dış Cephe Boyası 20L',
      category: 'paint',
      brand: 'Marshall',
      store: 'Tekzen',
      price: 1250,
      originalPrice: 1450,
      discount: 14,
      distance: 3.8,
      rating: 4.9,
      stock: true,
      deliveryTime: 'Aynı gün',
      features: ['Su bazlı', 'UV korumalı', '10 yıl garanti'],
      image: '/api/placeholder/100/100'
    }
  ]

  const demoStores: Store[] = [
    {
      id: '1',
      name: 'Koçtaş',
      distance: 2.3,
      rating: 4.7,
      phone: '0850 222 5656',
      address: 'Ataşehir, İstanbul',
      open: true
    },
    {
      id: '2',
      name: 'Migros',
      distance: 2.5,
      rating: 4.6,
      phone: '0850 250 5050',
      address: 'Kadıköy, İstanbul',
      open: true
    },
    {
      id: '3',
      name: 'Tekzen',
      distance: 3.8,
      rating: 4.5,
      phone: '0850 252 8396',
      address: 'Ümraniye, İstanbul',
      open: true
    }
  ]

  useEffect(() => {
    // Demo veriyi yükle
    setMaterials(demoMaterials)
    setStores(demoStores)
  }, [])

  const handleLocationRequest = () => {
    setLoading(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          setLoading(false)
        },
        (error) => {
          console.error('Konum alınamadı:', error)
          setLoading(false)
        }
      )
    }
  }

  const filteredMaterials = materials
    .filter(material => {
      const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           material.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           material.store.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || material.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price - b.price
        case 'price-desc':
          return b.price - a.price
        case 'distance':
          return a.distance - b.distance
        case 'rating':
          return b.rating - a.rating
        case 'discount':
          return (b.discount || 0) - (a.discount || 0)
        default:
          return 0
      }
    })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-gradient">Akıllı Malzeme Hub</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            En yakın yapı marketlerden gerçek zamanlı fiyat karşılaştırması
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Malzeme Ara
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Malzeme, marka veya mağaza ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategori seç" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sırala" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4 mt-4">
              <Button 
                onClick={handleLocationRequest} 
                disabled={loading}
                variant="outline"
                className="flex items-center gap-2"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <MapPin className="w-4 h-4" />
                )}
                Konumumu Kullan
              </Button>
              
              {userLocation && (
                <Badge variant="secondary" className="text-green-600">
                  Konum aktif
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="grid lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Materials List */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">
                Sonuçlar ({filteredMaterials.length})
              </h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="w-4 h-4" />
                {stores.length} mağaza bulundu
              </div>
            </div>

            <div className="space-y-4">
              {filteredMaterials.map((material) => (
                <Card key={material.id} className="hover:shadow-lg transition-all">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row items-start gap-4">
                      <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="w-8 h-8 text-primary" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row items-start justify-between mb-4">
                          <div className="mb-3 md:mb-0">
                            <h3 className="text-lg font-semibold truncate">{material.name}</h3>
                            <p className="text-muted-foreground">{material.brand}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">{material.store}</Badge>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm">{material.rating}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">{material.distance}km</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              {material.originalPrice && (
                                <span className="text-sm text-muted-foreground line-through">
                                  ₺{material.originalPrice}
                                </span>
                              )}
                              <span className="text-2xl font-bold text-primary">
                                ₺{material.price}
                              </span>
                            </div>
                            {material.discount && (
                              <Badge variant="destructive" className="mt-1">
                                <Percent className="w-3 h-3 mr-1" />
                                %{material.discount} indirim
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col md:flex-row items-center justify-between mt-4">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3 md:mb-0">
                            <div className="flex items-center gap-1">
                              <Truck className="w-4 h-4" />
                              {material.deliveryTime}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {material.stock ? 'Stokta' : 'Tükendi'}
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" variant="outline">
                              <Heart className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Share2 className="w-4 h-4" />
                            </Button>
                            <Button size="sm">
                              <Navigation className="w-4 h-4 mr-1" />
                              Yol Tarifi
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-3">
                          {material.features.map((feature, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Stores Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Yakındaki Mağazalar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                {stores.map((store) => (
                  <div key={store.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{store.name}</h4>
                      {store.open && (
                        <Badge variant="outline" className="text-green-600">
                          Açık
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {store.distance}km
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {store.rating}
                      </div>
                      <div>{store.address}</div>
                      <div>{store.phone}</div>
                    </div>
                    
                    <Button size="sm" className="w-full mt-3">
                      <Navigation className="w-4 h-4 mr-1" />
                      Yol Tarifi
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}