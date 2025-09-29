'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import qrcode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { plans as initialPlans } from '@/lib/mock-data';
import { LogOut, Users, FileText, Settings, Plus, Edit, Trash2, Save, X, QrCode, ImagePlus, CheckCircle2, HomeIcon, Building2, Heart } from 'lucide-react';
import { homePageContent as initialHomePageContent } from '@/lib/home-content';
import { ourSpaceContent as initialOurSpaceContent } from '@/lib/our-space-content';
import { memorialPageContent as initialMemorialPageContent } from '@/lib/memorial-content';
import { shortenLink } from '@/ai/flows/shorten-link-flow';
import { getMemorials, saveMemorial, deleteMemorial, getNextMemorialId, PetMemorial, PetMemorialWithDatesAsString, saveContent, getContent } from '@/lib/firebase-service';
import { Timestamp } from 'firebase/firestore';


const isValidImageUrl = (url: string | undefined | null): boolean => {
    if (!url) return false;
    try {
        const parsedUrl = new URL(url);
        return ['http:', 'https:', 'data:'].includes(parsedUrl.protocol);
    } catch (e) {
        return false;
    }
};

const isDirectImageLink = (url: string) => {
    return /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(url);
};

const directImageUrlSchema = z.string().url("URL inválida.");


// Zod schema for client-side form validation (dates are strings)
const petSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "O nome do pet é obrigatório."),
  species: z.string().min(1, "A raça é obrigatória."),
  sexo: z.string().min(1, "O sexo é obrigatório."),
  age: z.string().min(1, "A idade é obrigatória."),
  family: z.string().min(1, "A família é obrigatória."),
  birthDate: z.string().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: "Data de nascimento inválida.",
  }),
  passingDate: z.string().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: "Data de falecimento inválida.",
  }),
  arvore: z.string().min(1, "A árvore é obrigatória."),
  local: z.string().min(1, "O local é obrigatório."),
  tutores: z.string().min(1, "Os tutores são obrigatórios."),
  text: z.string().min(10, "O texto do memorial deve ter pelo menos 10 caracteres."),
  images: z.array(z.object({
      id: z.string(),
      imageUrl: directImageUrlSchema.or(z.literal('')),
      description: z.string().optional(),
      imageHint: z.string().optional()
  })).min(5, "É necessário adicionar pelo menos 5 imagens válidas."),
  qrCodeUrl: z.string().url().optional().or(z.literal('')),
});

type PetMemorialForm = z.infer<typeof petSchema>;


const aboutPageSchema = z.object({
  headerTitle: z.string().min(1, "Título é obrigatório."),
  headerDescription: z.string().min(1, "Descrição do cabeçalho é obrigatória."),
  missionTitle: z.string().min(1, "Título da missão é obrigatório."),
  missionDescription: z.string().min(1, "Descrição da missão é obrigatória."),
  missionImageUrl: directImageUrlSchema.optional().or(z.literal('')),
  historyTitle: z.string().min(1, "Título da história é obrigatório."),
  historyDescription: z.string().min(1, "Descrição da história é obrigatória."),
  historyImageUrl: directImageUrlSchema.optional().or(z.literal('')),
});

type AboutPageContent = z.infer<typeof aboutPageSchema>;

const generalContentSchema = z.object({
  whatsappNumber: z.string().min(10, "Número do WhatsApp é obrigatório."),
  whatsappLink: z.string().url("Link do WhatsApp é obrigatório."),
  phone: z.string().min(10, "Número de telefone é obrigatório."),
  address: z.string().min(10, "Endereço é obrigatório."),
  instagramLink: z.string().url("Link do Instagram é obrigatório."),
});

type GeneralContent = z.infer<typeof generalContentSchema>;

const planSchema = z.object({
    name: z.string().min(1, 'Nome do plano é obrigatório.'),
    price: z.string().min(1, 'Preço é obrigatório.'),
    description: z.string().min(1, 'Descrição é obrigatória.'),
    features: z.array(z.string().min(1, 'Característica não pode ser vazia.')).min(1, 'Adicione pelo menos uma característica.'),
    pricingDetails: z.array(z.string()).optional(),
    optional: z.string().optional(),
    isMostChosen: z.boolean(),
});

const plansPageSchema = z.object({
    plans: z.array(planSchema)
});

type PlansPageContent = z.infer<typeof plansPageSchema>;

const heroSlideSchema = z.object({
    imageUrl: directImageUrlSchema.optional().or(z.literal('')),
    title: z.string().min(1, 'Título é obrigatório'),
    subtitle: z.string().min(1, 'Subtítulo é obrigatório'),
});
const whyChooseUsItemSchema = z.object({
    icon: z.string().min(1, 'Ícone é obrigatório'),
    title: z.string().min(1, 'Título é obrigatório'),
    description: z.string().min(1, 'Descrição é obrigatória'),
});
const cremationProcessStepSchema = z.object({
    step: z.string().min(1, 'Passo é obrigatório'),
    title: z.string().min(1, 'Título é obrigatório'),
    description: z.string().min(1, 'Descrição é obrigatória'),
});
const allPetsSectionSchema = z.object({
    title: z.string().min(1, 'Título é obrigatório'),
    description: z.string().min(1, 'Descrição é obrigatória'),
    imageUrl: directImageUrlSchema.optional().or(z.literal('')),
    petsList: z.array(z.string().min(1, 'O item da lista não pode ser vazio')),
});

const homePageSchema = z.object({
    heroSlides: z.array(heroSlideSchema),
    whyChooseUs: z.object({
        title: z.string().min(1, 'Título é obrigatório'),
        description: z.string().min(1, 'Descrição é obrigatória'),
        items: z.array(whyChooseUsItemSchema),
    }),
    cremationProcess: z.object({
        title: z.string().min(1, 'Título é obrigatório'),
        description: z.string().min(1, 'Descrição é obrigatória'),
        steps: z.array(cremationProcessStepSchema),
    }),
    allPetsSection: allPetsSectionSchema,
});

type HomePageContent = z.infer<typeof homePageSchema>;

const galleryItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Título da imagem é obrigatório."),
  imageUrl: directImageUrlSchema.optional().or(z.literal('')),
});

const ourSpaceSchema = z.object({
  headerTitle: z.string().min(1, "Título é obrigatório."),
  headerDescription: z.string().min(1, "Descrição é obrigatória."),
  gallery: z.array(galleryItemSchema),
});

type OurSpaceContent = z.infer<typeof ourSpaceSchema>;


const memorialPageSchema = z.object({
  heroImageUrl: directImageUrlSchema.optional().or(z.literal('')),
  heroTitle: z.string().min(1, "Título é obrigatório."),
  heroDescription1: z.string().min(1, "Primeiro parágrafo da descrição é obrigatório."),
  heroDescription2: z.string().min(1, "Segundo parágrafo da descrição é obrigatório."),
  createMemorialTitle: z.string().min(1, "Título do card 'Criar Memorial' é obrigatório."),
  createMemorialDescription: z.string().min(1, "Descrição do card 'Criar Memorial' é obrigatória."),
});

type MemorialPageContent = z.infer<typeof memorialPageSchema>;


export default function AdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pets, setPets] = useState<PetMemorial[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<PetMemorial | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const qrCodeCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('petEstrelaAuth') === 'authenticated';
    if (!isLoggedIn) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
      fetchPets();
    }
  }, [router]);

  const fetchPets = async () => {
    const petsData = await getMemorials();
    setPets(petsData);
  }
  
  useEffect(() => {
    if (isFormOpen && editingPet?.qrCodeUrl && qrCodeCanvasRef.current) {
      qrcode.toCanvas(qrCodeCanvasRef.current, editingPet.qrCodeUrl, { width: 128, margin: 2 }, (error) => {
        if (error) console.error("Error generating QR code:", error);
      });
    }
  }, [isFormOpen, editingPet]);
  
  const petForm = useForm<PetMemorialForm>({
    resolver: zodResolver(petSchema),
    defaultValues: {
      id: 0,
      name: '', species: '', sexo: '', age: '', family: '', birthDate: '', passingDate: '',
      arvore: '', local: '', tutores: '', text: '', images: [], qrCodeUrl: '',
    },
  });

  const { fields: petImagesFields, append: appendPetImage, remove: removePetImage } = useFieldArray({
    control: petForm.control,
    name: "images"
  });

  const aboutForm = useForm<AboutPageContent>({
    resolver: zodResolver(aboutPageSchema),
    defaultValues: {
        headerTitle: '',
        headerDescription: '',
        missionTitle: '',
        missionDescription: '',
        missionImageUrl: '',
        historyTitle: '',
        historyDescription: '',
        historyImageUrl: '',
    },
  });
  
  const generalForm = useForm<GeneralContent>({
    resolver: zodResolver(generalContentSchema),
    defaultValues: {
      whatsappNumber: '',
      whatsappLink: '',
      phone: '',
      address: '',
      instagramLink: '',
    }
  });

  const plansForm = useForm<PlansPageContent>({
    resolver: zodResolver(plansPageSchema),
    defaultValues: { plans: [] },
  });
  
  const homeForm = useForm<HomePageContent>({
    resolver: zodResolver(homePageSchema),
    defaultValues: initialHomePageContent
  });

  const ourSpaceForm = useForm<OurSpaceContent>({
    resolver: zodResolver(ourSpaceSchema),
    defaultValues: initialOurSpaceContent
  });

  const memorialForm = useForm<MemorialPageContent>({
    resolver: zodResolver(memorialPageSchema),
    defaultValues: initialMemorialPageContent
  });
  
  const { fields: heroSlidesFields, append: appendHeroSlide, remove: removeHeroSlide } = useFieldArray({
      control: homeForm.control, name: "heroSlides"
  });

  const { fields: planFields, append: appendPlan, remove: removePlan } = useFieldArray({
      control: plansForm.control,
      name: "plans"
  });
  
  const { fields: galleryFields, append: appendGallery, remove: removeGallery } = useFieldArray({
      control: ourSpaceForm.control, name: "gallery"
  });

  const loadContentFromDB = useCallback(async () => {
      // Load About Page Content
      const aboutData = await getContent<AboutPageContent>('aboutPageContent');
      if (aboutData) aboutForm.reset(aboutData);
      else aboutForm.reset({
            headerTitle: "Sobre o Pet Estrela",
            headerDescription: "Há mais de 10 anos, nossa missão é proporcionar uma despedida digna e respeitosa, transformando a dor da perda em uma celebração do amor e da amizade.",
            missionTitle: "Nossa Missão",
            missionDescription: "Nossa missão é oferecer um serviço de cremação pet que transcenda o procedimento técnico. Buscamos acolher as famílias em um dos momentos mais delicados, garantindo que a memória de seus companheiros seja honrada com a máxima dignidade. Acreditamos que cada vida, não importa o quão pequena, merece uma despedida grandiosa.",
            missionImageUrl: '',
            historyTitle: "Nossa História",
            historyDescription: "Fundada em 2014 com o sonho de oferecer um serviço funerário pet diferenciado, a Pet Estrela nasceu da paixão e do respeito pelos animais. Ao longo dos anos, crescemos e nos modernizamos, mas nunca perdemos a essência do nosso trabalho: o acolhimento.",
            historyImageUrl: '',
        });
      
      // Load General Content
      const generalData = await getContent<GeneralContent>('generalContent');
      if (generalData) generalForm.reset(generalData);
      else generalForm.reset({
        whatsappNumber: '1142405253',
        whatsappLink: 'https://wa.me/551142405253',
        phone: '(11) 4240-5253',
        address: 'Av. Adília Barbosa Neves, 2740, Centro Industrial, Arujá - SP, CEP: 07432-575',
        instagramLink: 'https://www.instagram.com/petestrelacrematorio/',
      });
      
      // Load Plans Page Content
      const plansData = await getContent<PlansPageContent>('plansPageContent');
      if (plansData && plansData.plans.length > 0) plansForm.reset(plansData);
      else plansForm.reset({ plans: initialPlans });

      // Load Home Page Content
      const homeData = await getContent<HomePageContent>('homePageContent');
      if (homeData) homeForm.reset(homeData);
      else homeForm.reset(initialHomePageContent);

      // Load Our Space Content
      const ourSpaceData = await getContent<OurSpaceContent>('ourSpaceContent');
      if (ourSpaceData) ourSpaceForm.reset(ourSpaceData);
      else ourSpaceForm.reset(initialOurSpaceContent);

      // Load Memorial Page Content
      const memorialData = await getContent<MemorialPageContent>('memorialPageContent');
      if (memorialData) memorialForm.reset(memorialData);
      else memorialForm.reset(initialMemorialPageContent);

  }, [aboutForm, generalForm, plansForm, homeForm, ourSpaceForm, memorialForm]);

  useEffect(() => {
    if (isAuthenticated) {
      loadContentFromDB();
    }
  }, [isAuthenticated, loadContentFromDB]);

  const formatDateForInput = (date: Timestamp | Date | string | undefined): string => {
    if (!date) return '';
    let d: Date;
    if (date instanceof Timestamp) {
      d = date.toDate();
    } else if (date instanceof Date) {
      d = date;
    } else {
      d = new Date(date);
    }
    if (isNaN(d.getTime())) return '';
    
    // To avoid timezone issues, get the UTC date parts
    const year = d.getUTCFullYear();
    const month = (d.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = d.getUTCDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const setupForm = async () => {
      if (editingPet) {
        petForm.reset({
          ...editingPet,
          birthDate: formatDateForInput(editingPet.birthDate),
          passingDate: formatDateForInput(editingPet.passingDate),
        });
      } else {
        const nextId = await getNextMemorialId();
        petForm.reset({
          id: nextId,
          name: '', species: '', sexo: '', age: '', family: '', birthDate: '', passingDate: '',
          arvore: '', local: '', tutores: '', text: '', 
          images: Array(5).fill(null).map(()=>({ id: `img-${Date.now()}-${Math.random()}`, imageUrl: '' })),
          qrCodeUrl: '',
        });
      }
    };
    if (isFormOpen) {
      setupForm();
    }
  }, [editingPet, petForm, isFormOpen]);

  const handleLogout = () => {
    localStorage.removeItem('petEstrelaAuth');
    toast({ title: 'Logout realizado com sucesso.' });
    router.push('/');
  };

  const handleOpenForm = (pet: PetMemorial | null) => {
    setEditingPet(pet);
    setIsFormOpen(true);
  };
  
  const handleSavePet = async (data: PetMemorialForm) => {
    setIsSaving(true);
    try {
      const { shortUrl } = await shortenLink({ memorialId: data.id });
      
      const validImages = data.images.filter(image => image.imageUrl && isValidImageUrl(image.imageUrl));
      
      if (validImages.length < 5) {
          petForm.setError("images", { 
              type: "manual", 
              message: "Por favor, forneça pelo menos 5 URLs de imagem válidas." 
          });
          setIsSaving(false);
          return;
      }
      
      const petToSave: PetMemorialWithDatesAsString = {
        ...data,
        images: validImages,
        qrCodeUrl: shortUrl,
        createdAt: editingPet?.createdAt || Timestamp.now(),
      };

      await saveMemorial(petToSave);
      
      toast({ title: `Memorial de ${data.name} ${editingPet ? 'atualizado' : 'criado'} com sucesso.` });
      fetchPets();
      setIsFormOpen(false);
      setEditingPet(null);
    } catch (error) {
        console.error("Error saving pet memorial: ", error);
        toast({
            variant: "destructive",
            title: "Erro ao salvar",
            description: "Não foi possível salvar o memorial. Verifique os dados e tente novamente.",
        });
    } finally {
        setIsSaving(false);
    }
  };

  const handleDeletePet = async (petId: number) => {
    const petToDelete = pets.find(p => p.id === petId);
    if(petToDelete){
        try {
            await deleteMemorial(petId);
            toast({ title: `Memorial de ${petToDelete.name} excluído com sucesso.` });
            fetchPets(); // Refresh the list
        } catch (error) {
             toast({
                variant: "destructive",
                title: "Erro ao excluir",
                description: "Não foi possível excluir o memorial. Tente novamente.",
            });
        }
    }
  };

  const handleSaveAboutContent = async (data: AboutPageContent) => {
    setIsSaving(true);
    try {
        await saveContent('aboutPageContent', data);
        toast({ title: 'Conteúdo da página "Sobre Nós" atualizado com sucesso.' });
    } catch (error) {
        console.error("Error saving about content: ", error);
        toast({ variant: 'destructive', title: 'Erro ao Salvar', description: 'Não foi possível salvar o conteúdo.' });
    } finally {
        setIsSaving(false);
    }
  };

  const handleSaveHomeContent = async (data: HomePageContent) => {
    setIsSaving(true);
    try {
        await saveContent('homePageContent', data);
        toast({ title: 'Conteúdo da página "Home" atualizado com sucesso.' });
    } catch (error) {
        console.error("Error saving home content: ", error);
        toast({ variant: 'destructive', title: 'Erro ao Salvar', description: 'Não foi possível salvar o conteúdo.' });
    } finally {
        setIsSaving(false);
    }
  };

  const handleSaveGeneralContent = async (data: GeneralContent) => {
    setIsSaving(true);
    try {
      await saveContent('generalContent', data);
      toast({ title: 'Conteúdo geral do site atualizado com sucesso.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao Salvar', description: 'Não foi possível salvar o conteúdo.' });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleSavePlansContent = async (data: PlansPageContent) => {
    setIsSaving(true);
    try {
      await saveContent('plansPageContent', data);
      toast({ title: 'Conteúdo da página de planos atualizado com sucesso.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao Salvar', description: 'Não foi possível salvar o conteúdo.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveOurSpaceContent = async (data: OurSpaceContent) => {
    setIsSaving(true);
    try {
        await saveContent('ourSpaceContent', data);
        toast({ title: 'Conteúdo da página "Nosso Espaço" atualizado com sucesso.' });
    } catch (error) {
        console.error("Error saving our space content: ", error);
        toast({ variant: 'destructive', title: 'Erro ao Salvar', description: 'Não foi possível salvar o conteúdo.' });
    } finally {
        setIsSaving(false);
    }
  };


  const handleSaveMemorialPageContent = async (data: MemorialPageContent) => {
    setIsSaving(true);
    try {
        await saveContent('memorialPageContent', data);
        toast({ title: 'Conteúdo da página "Memorial" atualizado com sucesso.' });
    } catch (error) {
        console.error("Error saving memorial page content: ", error);
        toast({ variant: 'destructive', title: 'Erro ao Salvar', description: 'Não foi possível salvar o conteúdo.' });
    } finally {
        setIsSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Verificando autenticação...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 p-4 sm:p-8">
      <div className="container mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-headline text-3xl font-bold text-gradient-luxury">
              Painel Administrativo
            </h1>
            <p className="text-muted-foreground">Pet Estrela Crematório</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </header>

        <Tabs defaultValue="pets" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 md:grid-cols-7">
            <TabsTrigger value="home"><HomeIcon className="mr-1 md:mr-2" /> <span className="hidden md:inline">Home</span></TabsTrigger>
            <TabsTrigger value="memorial"><Heart className="mr-1 md:mr-2" /> <span className="hidden md:inline">Memorial</span></TabsTrigger>
            <TabsTrigger value="pets"><Users className="mr-1 md:mr-2" /> <span className="hidden md:inline">Pets</span></TabsTrigger>
            <TabsTrigger value="about"><FileText className="mr-1 md:mr-2" /> <span className="hidden md:inline">Sobre</span></TabsTrigger>
            <TabsTrigger value="space"><Building2 className="mr-1 md:mr-2" /> <span className="hidden md:inline">Espaço</span></TabsTrigger>
            <TabsTrigger value="plans"><CheckCircle2 className="mr-1 md:mr-2" /> <span className="hidden md:inline">Planos</span></TabsTrigger>
            <TabsTrigger value="general"><Settings className="mr-1 md:mr-2" /> <span className="hidden md:inline">Geral</span></TabsTrigger>
          </TabsList>
          
          <TabsContent value="home" className="mt-6">
            <Card>
              <CardHeader><CardTitle>Editar Página Home</CardTitle></CardHeader>
              <CardContent>
                <Form {...homeForm}>
                  <form onSubmit={homeForm.handleSubmit(handleSaveHomeContent)} className="space-y-8">
                    {/* Hero Section */}
                    <Card className="p-4">
                      <CardHeader className='flex-row items-center justify-between'>
                        <CardTitle>Carrossel Principal (Hero)</CardTitle>
                        <Button type="button" size="sm" onClick={() => appendHeroSlide({ imageUrl: '', title: '', subtitle: '' })}><Plus className="mr-2" /> Adicionar Slide</Button>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {heroSlidesFields.map((slide, index) => (
                          <div key={slide.id} className="space-y-2 rounded-md border p-4 relative">
                            <div className='flex justify-between items-center'>
                              <h4 className="font-semibold">Slide {index + 1}</h4>
                              <Button type="button" variant="destructive" size="icon" onClick={() => removeHeroSlide(index)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                            <FormField control={homeForm.control} name={`heroSlides.${index}.title`} render={({ field }) => (<FormItem><FormLabel>Título</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={homeForm.control} name={`heroSlides.${index}.subtitle`} render={({ field }) => (<FormItem><FormLabel>Subtítulo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={homeForm.control} name={`heroSlides.${index}.imageUrl`} render={({ field }) => (
                                <FormItem>
                                    <FormLabel>URL da Imagem</FormLabel>
                                    <FormControl>
                                      <div className='flex items-center gap-2'>
                                        <Input placeholder="Cole a URL da imagem aqui" {...field} />
                                        {field.value && isValidImageUrl(field.value) && <Image src={field.value} alt="Preview" width={40} height={40} className="rounded-md object-cover" />}
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                     {/* Why Choose Us */}
                    <Card className="p-4">
                        <CardHeader><CardTitle>Seção "Por que escolher?"</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                             <FormField control={homeForm.control} name="whyChooseUs.title" render={({ field }) => (<FormItem><FormLabel>Título da Seção</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                             <FormField control={homeForm.control} name="whyChooseUs.description" render={({ field }) => (<FormItem><FormLabel>Descrição da Seção</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                             {homeForm.watch('whyChooseUs.items').map((item, index) => (
                                 <div key={index} className="space-y-2 rounded-md border p-4">
                                     <h4 className="font-semibold">Item {index + 1}</h4>
                                     <FormField control={homeForm.control} name={`whyChooseUs.items.${index}.icon`} render={({ field }) => (<FormItem><FormLabel>Ícone do Item (Nome do Lucide Icon)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                     <FormField control={homeForm.control} name={`whyChooseUs.items.${index}.title`} render={({ field }) => (<FormItem><FormLabel>Título do Item</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                     <FormField control={homeForm.control} name={`whyChooseUs.items.${index}.description`} render={({ field }) => (<FormItem><FormLabel>Descrição do Item</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                 </div>
                             ))}
                        </CardContent>
                    </Card>

                     {/* Cremation Process */}
                     <Card className="p-4">
                         <CardHeader><CardTitle>Seção "Processo de Cremação"</CardTitle></CardHeader>
                         <CardContent className="space-y-4">
                              <FormField control={homeForm.control} name="cremationProcess.title" render={({ field }) => (<FormItem><FormLabel>Título da Seção</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                              <FormField control={homeForm.control} name="cremationProcess.description" render={({ field }) => (<FormItem><FormLabel>Descrição da Seção</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                              {homeForm.watch('cremationProcess.steps').map((step, index) => (
                                  <div key={index} className="space-y-2 rounded-md border p-4">
                                      <h4 className="font-semibold">Passo {step.step}</h4>
                                      <FormField control={homeForm.control} name={`cremationProcess.steps.${index}.title`} render={({ field }) => (<FormItem><FormLabel>Título do Passo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                      <FormField control={homeForm.control} name={`cremationProcess.steps.${index}.description`} render={({ field }) => (<FormItem><FormLabel>Descrição do Passo</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                                  </div>
                              ))}
                         </CardContent>
                     </Card>

                     {/* All Pets Section */}
                    <Card className="p-4">
                        <CardHeader><CardTitle>Seção "Todos os Pets"</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <FormField control={homeForm.control} name="allPetsSection.title" render={({ field }) => (<FormItem><FormLabel>Título da Seção</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={homeForm.control} name="allPetsSection.description" render={({ field }) => (<FormItem><FormLabel>Descrição da Seção</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={homeForm.control} name="allPetsSection.imageUrl" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>URL da Imagem da Seção</FormLabel>
                                    <FormControl>
                                      <div className='flex items-center gap-2'>
                                        <Input placeholder="Cole a URL da imagem aqui" {...field} />
                                        {field.value && isValidImageUrl(field.value) && <Image src={field.value} alt="Preview" width={40} height={40} className="rounded-md object-cover" />}
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </CardContent>
                    </Card>

                    <Button type="submit" disabled={isSaving}><Save className="mr-2" /> {isSaving ? 'Salvando...' : 'Salvar Página Home'}</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="memorial" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Editar Página Memorial</CardTitle>
              </CardHeader>
              <CardContent>
                    <Form {...memorialForm}>
                        <form onSubmit={memorialForm.handleSubmit(handleSaveMemorialPageContent)} className="space-y-6">
                            <h3 className="text-lg font-semibold text-primary">Seção Principal</h3>
                            <FormField control={memorialForm.control} name="heroImageUrl" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>URL da Imagem de Fundo</FormLabel>
                                    <FormControl>
                                      <div className='flex items-center gap-2'>
                                        <Input placeholder="Cole a URL da imagem aqui" {...field} />
                                        {field.value && isValidImageUrl(field.value) && <Image src={field.value} alt="Preview" width={40} height={40} className="rounded-md object-cover" />}
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={memorialForm.control} name="heroTitle" render={({ field }) => (<FormItem><FormLabel>Título</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={memorialForm.control} name="heroDescription1" render={({ field }) => (<FormItem><FormLabel>Descrição (Parágrafo 1)</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={memorialForm.control} name="heroDescription2" render={({ field }) => (<FormItem><FormLabel>Descrição (Parágrafo 2)</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl><FormMessage /></FormItem>)} />

                            <h3 className="text-lg font-semibold text-primary mt-6">Card "Criar Memorial"</h3>
                            <FormField control={memorialForm.control} name="createMemorialTitle" render={({ field }) => (<FormItem><FormLabel>Título do Card</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={memorialForm.control} name="createMemorialDescription" render={({ field }) => (<FormItem><FormLabel>Descrição do Card</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />

                            <Button type="submit" disabled={isSaving}><Save className="mr-2" /> {isSaving ? 'Salvando...' : 'Salvar Página Memorial'}</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pets" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Memoriais de Pets</CardTitle>
                <Button onClick={() => handleOpenForm(null)}>
                  <Plus className="mr-2" /> Novo Pet
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {pets.map((pet) => (
                    <Card key={pet.id} className="luxury-card overflow-hidden">
                      {pet.images && pet.images.length > 0 && pet.images[0].imageUrl && (
                        <div className="relative h-52 w-full">
                          <Image
                            src={pet.images[0].imageUrl}
                            alt={pet.images[0].description ?? ''}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle className="font-headline text-2xl">{pet.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{pet.species} - {pet.age}</p>
                        <p className="text-sm text-muted-foreground">Família {pet.family}</p>
                      </CardHeader>
                      <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleOpenForm(pet)}>
                          <Edit className="mr-2 h-4 w-4" /> Editar
                        </Button>
                         <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="mr-2 h-4 w-4" /> Excluir
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. Isso excluirá permanentemente o memorial de {pet.name}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeletePet(pet.id)}>Excluir</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="about" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Editar Página "Sobre Nós"</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...aboutForm}>
                        <form onSubmit={aboutForm.handleSubmit(handleSaveAboutContent)} className="space-y-6">
                            <h3 className="text-lg font-semibold text-primary">Seção do Cabeçalho</h3>
                            <FormField control={aboutForm.control} name="headerTitle" render={({ field }) => (<FormItem><FormLabel>Título Principal</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={aboutForm.control} name="headerDescription" render={({ field }) => (<FormItem><FormLabel>Descrição do Cabeçalho</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl><FormMessage /></FormItem>)} />
                            
                            <h3 className="text-lg font-semibold text-primary mt-6">Seção Missão</h3>
                            <FormField control={aboutForm.control} name="missionTitle" render={({ field }) => (<FormItem><FormLabel>Título da Missão</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={aboutForm.control} name="missionDescription" render={({ field }) => (<FormItem><FormLabel>Descrição da Missão</FormLabel><FormControl><Textarea {...field} rows={5} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={aboutForm.control} name="missionImageUrl" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>URL da Imagem da Missão</FormLabel>
                                    <FormControl>
                                      <div className='flex items-center gap-2'>
                                        <Input placeholder="Cole a URL da imagem aqui" {...field} />
                                        {field.value && isValidImageUrl(field.value) && <Image src={field.value} alt="Preview" width={40} height={40} className="rounded-md object-cover" />}
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <h3 className="text-lg font-semibold text-primary mt-6">Seção História</h3>
                             <FormField control={aboutForm.control} name="historyTitle" render={({ field }) => (<FormItem><FormLabel>Título da História</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={aboutForm.control} name="historyDescription" render={({ field }) => (<FormItem><FormLabel>Descrição da História</FormLabel><FormControl><Textarea {...field} rows={4} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={aboutForm.control} name="historyImageUrl" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>URL da Imagem da História</FormLabel>
                                    <FormControl>
                                      <div className='flex items-center gap-2'>
                                        <Input placeholder="Cole a URL da imagem aqui" {...field} />
                                        {field.value && isValidImageUrl(field.value) && <Image src={field.value} alt="Preview" width={40} height={40} className="rounded-md object-cover" />}
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                             )} />

                            <Button type="submit" disabled={isSaving}><Save className="mr-2" /> {isSaving ? 'Salvando...' : 'Salvar Alterações'}</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="space" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Editar Página "Nosso Espaço"</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...ourSpaceForm}>
                        <form onSubmit={ourSpaceForm.handleSubmit(handleSaveOurSpaceContent)} className="space-y-6">
                            <FormField control={ourSpaceForm.control} name="headerTitle" render={({ field }) => (<FormItem><FormLabel>Título Principal</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={ourSpaceForm.control} name="headerDescription" render={({ field }) => (<FormItem><FormLabel>Descrição do Cabeçalho</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl><FormMessage /></FormItem>)} />
                            
                            <Card className="p-4">
                                <CardHeader className="flex-row items-center justify-between">
                                    <CardTitle>Galeria de Imagens</CardTitle>
                                    <Button type="button" size="sm" onClick={() => appendGallery({ id: `gallery-${Date.now()}`, title: '', imageUrl: '' })}><Plus className="mr-2" /> Adicionar Imagem</Button>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {galleryFields.map((item, index) => (
                                        <div key={item.id} className="space-y-2 rounded-md border p-4 relative">
                                            <div className='flex justify-between items-center'>
                                              <h4 className="font-semibold">Imagem {index + 1}</h4>
                                              <Button type="button" variant="destructive" size="icon" onClick={() => removeGallery(index)}><Trash2 className="h-4 w-4" /></Button>
                                            </div>
                                            <FormField control={ourSpaceForm.control} name={`gallery.${index}.title`} render={({ field }) => (<FormItem><FormLabel>Título da Imagem</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                            <FormField control={ourSpaceForm.control} name={`gallery.${index}.imageUrl`} render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>URL da Imagem</FormLabel>
                                                    <FormControl>
                                                        <div className='flex items-center gap-2'>
                                                          <Input placeholder="Cole a URL da imagem aqui" {...field} />
                                                          {field.value && isValidImageUrl(field.value) && <Image src={field.value} alt="Preview" width={40} height={40} className="rounded-md object-cover" />}
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            <Button type="submit" disabled={isSaving}><Save className="mr-2" /> {isSaving ? 'Salvando...' : 'Salvar Página "Nosso Espaço"'}</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
          </TabsContent>


          <TabsContent value="plans" className="mt-6">
            <Card>
                <CardHeader className='flex-row items-center justify-between'>
                    <CardTitle>Editar Página de Planos</CardTitle>
                    <Button type="button" size="sm" onClick={() => appendPlan({ name: 'Novo Plano', price: '', description: '', features: [], isMostChosen: false })}><Plus className="mr-2" /> Adicionar Plano</Button>
                </CardHeader>
                <CardContent>
                    <Form {...plansForm}>
                        <form onSubmit={plansForm.handleSubmit(handleSavePlansContent)} className="space-y-8">
                            {planFields.map((plan, planIndex) => (
                                <Card key={plan.id} className="p-4 border-primary/20 relative">
                                    <CardHeader className="flex-row items-center justify-between">
                                        <CardTitle>Plano {planIndex + 1}: {plansForm.watch(`plans.${planIndex}.name`)}</CardTitle>
                                        <Button type="button" variant="destructive" size="icon" onClick={() => removePlan(planIndex)}><Trash2 className="h-4 w-4" /></Button>
                                    </CardHeader>
                                    <CardContent className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                        <FormField control={plansForm.control} name={`plans.${planIndex}.name`} render={({ field }) => (<FormItem><FormLabel>Nome do Plano</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={plansForm.control} name={`plans.${planIndex}.price`} render={({ field }) => (<FormItem><FormLabel>Preço</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={plansForm.control} name={`plans.${planIndex}.description`} render={({ field }) => (<FormItem className="col-span-1 md:col-span-2"><FormLabel>Descrição</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                                        
                                        <div className='col-span-1 md:col-span-2'>
                                            <Label>Características</Label>
                                            <Controller
                                                control={plansForm.control}
                                                name={`plans.${planIndex}.features`}
                                                render={({ field }) => (
                                                    <div className="space-y-2 mt-2">
                                                        {field.value.map((feature, featureIndex) => (
                                                            <div key={featureIndex} className="flex items-center gap-2">
                                                                <Input 
                                                                  value={feature} 
                                                                  onChange={(e) => {
                                                                      const newFeatures = [...field.value];
                                                                      newFeatures[featureIndex] = e.target.value;
                                                                      field.onChange(newFeatures);
                                                                  }}
                                                                />
                                                                 <Button type="button" variant="destructive" size="icon" onClick={() => {
                                                                    const newFeatures = [...field.value];
                                                                    newFeatures.splice(featureIndex, 1);
                                                                    field.onChange(newFeatures);
                                                                 }}><Trash2 className="h-4 w-4" /></Button>
                                                            </div>
                                                        ))}
                                                        <Button type="button" size="sm" variant="outline" className='mt-2' onClick={() => field.onChange([...field.value, 'Nova característica'])}><Plus className="mr-2 h-4 w-4" /> Adicionar Característica</Button>
                                                    </div>
                                                )}
                                            />
                                             <FormMessage />
                                        </div>
                                        
                                        <FormField control={plansForm.control} name={`plans.${planIndex}.optional`} render={({ field }) => (<FormItem className="col-span-1 md:col-span-2"><FormLabel>Texto Opcional</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    </CardContent>
                                </Card>
                            ))}
                            <Button type="submit" disabled={isSaving}><Save className="mr-2" /> {isSaving ? 'Salvando...' : 'Salvar Planos'}</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="general" className="mt-6">
             <Card>
              <CardHeader>
                <CardTitle>Editar Conteúdo Geral</CardTitle>
                 <CardDescription>Altere as informações de contato e links que aparecem em todo o site.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...generalForm}>
                  <form onSubmit={generalForm.handleSubmit(handleSaveGeneralContent)} className="space-y-6">
                    <FormField control={generalForm.control} name="whatsappNumber" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número do WhatsApp (somente números)</FormLabel>
                        <FormControl><Input placeholder="551142405253" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                     <FormField control={generalForm.control} name="whatsappLink" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Link do WhatsApp (completo)</FormLabel>
                        <FormControl><Input placeholder="https://wa.me/551142405253" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={generalForm.control} name="phone" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone para Contato</FormLabel>
                        <FormControl><Input placeholder="(11) 4240-5253" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={generalForm.control} name="address" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço Completo</FormLabel>
                        <FormControl><Textarea rows={3} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={generalForm.control} name="instagramLink" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Link do Instagram</FormLabel>
                            <FormControl><Input placeholder="https://instagram.com/seu-usuario" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <Button type="submit" disabled={isSaving}><Save className="mr-2" /> {isSaving ? 'Salvando...' : 'Salvar Conteúdo Geral'}</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

       <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-3xl text-primary">
              {editingPet ? `Editar Memorial de ${editingPet.name}` : 'Criar Novo Memorial'}
            </DialogTitle>
             <DialogDescription>
              Preencha as informações abaixo para gerenciar o memorial.
            </DialogDescription>
          </DialogHeader>
          <Form {...petForm}>
            <form onSubmit={petForm.handleSubmit(handleSavePet)} className="space-y-6">
                <div className="mt-4 max-h-[70vh] overflow-y-auto pr-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={petForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>Nome</FormLabel><FormControl><Input placeholder="Nome do Pet" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={petForm.control} name="species" render={({ field }) => (<FormItem><FormLabel>Raça</FormLabel><FormControl><Input placeholder="Ex: Golden Retriever" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={petForm.control} name="sexo" render={({ field }) => (<FormItem><FormLabel>Sexo</FormLabel><FormControl><Input placeholder="Ex: Macho" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={petForm.control} name="age" render={({ field }) => (<FormItem><FormLabel>Idade</FormLabel><FormControl><Input placeholder="Ex: 8 anos" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={petForm.control} name="family" render={({ field }) => (<FormItem><FormLabel>Família</FormLabel><FormControl><Input placeholder="Ex: Família Silva" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={petForm.control} name="tutores" render={({ field }) => (<FormItem><FormLabel>Tutores</FormLabel><FormControl><Input placeholder="Ex: Maria e João" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={petForm.control} name="birthDate" render={({ field }) => (<FormItem><FormLabel>Data de Nascimento</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={petForm.control} name="passingDate" render={({ field }) => (<FormItem><FormLabel>Data de Falecimento</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={petForm.control} name="arvore" render={({ field }) => (<FormItem><FormLabel>Árvore Plantada</FormLabel><FormControl><Input placeholder="Ex: Ipê Amarelo" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={petForm.control} name="local" render={({ field }) => (<FormItem><FormLabel>Local</FormLabel><FormControl><Input placeholder="Ex: Jardim da Saudade" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                    
                    <FormField control={petForm.control} name="text" render={({ field }) => (<FormItem><FormLabel>Texto Memorial</FormLabel><FormControl><Textarea placeholder="Escreva uma bela homenagem..." {...field} rows={5} /></FormControl><FormMessage /></FormItem>)} />

                    <div>
                        <Label>Fotos (Mínimo 5 URLs de imagem direta)</Label>
                         <p className="text-sm text-muted-foreground">A primeira imagem será a foto de capa do memorial. Cole as URLs das imagens abaixo.</p>
                         <div className="mt-2 space-y-2">
                         {petImagesFields.map((field, index) => (
                             <div key={field.id} className="flex items-center gap-2">
                                 <FormField
                                     control={petForm.control}
                                     name={`images.${index}.imageUrl`}
                                     render={({ field: imageField }) => (
                                         <FormItem className="flex-1">
                                             <FormControl>
                                                <div className='flex items-center gap-2'>
                                                   <Input 
                                                      placeholder={`URL da Imagem ${index + 1}`}
                                                      {...imageField}
                                                   />
                                                   {imageField.value && isValidImageUrl(imageField.value) && (
                                                     <Image src={imageField.value} alt={`Preview ${index + 1}`} width={40} height={40} className="rounded-md object-cover" />
                                                   )}
                                                </div>
                                             </FormControl>
                                             <FormMessage />
                                         </FormItem>
                                     )}
                                 />
                                <Button type="button" variant="destructive" size="icon" onClick={() => removePetImage(index)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                             </div>
                         ))}
                         </div>
                         <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => appendPetImage({ id: `img-${Date.now()}`, imageUrl: '', description: '', imageHint: '' })}
                         >
                            <ImagePlus className="mr-2" /> Adicionar Imagem
                         </Button>
                         <Controller
                            control={petForm.control}
                            name="images"
                            render={({ fieldState }) => <FormMessage>{fieldState.error?.message}</FormMessage>}
                         />
                    </div>
                    
                    {editingPet && (
                      <div className="space-y-2">
                        <Label>QR Code do Memorial</Label>
                        <div className='flex flex-col sm:flex-row items-center gap-4 rounded-lg border bg-muted/50 p-4'>
                          <QrCode className="h-16 w-16 text-muted-foreground" />
                          <div>
                            <h4 className="font-semibold">QR Code para {editingPet.name}</h4>
                            <p className="text-sm text-muted-foreground">Aponte a câmera para acessar a página do memorial. Você pode salvar e usar este código em materiais impressos.</p>
                             <canvas ref={qrCodeCanvasRef} className="mt-2 hidden" />
                             {qrCodeCanvasRef.current && (
                               <a 
                                href={qrCodeCanvasRef.current.toDataURL()} 
                                download={`qrcode-memorial-${editingPet.id}.png`}
                                className="text-sm text-primary hover:underline mt-2 inline-block"
                               >
                                Baixar QR Code
                               </a>
                             )}
                          </div>
                        </div>
                      </div>
                    )}

                </div>
                <div className='flex justify-end gap-2 mt-6'>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Cancelar</Button>
                    </DialogClose>
                    <Button type="submit" disabled={isSaving}>{isSaving ? 'Salvando...' : 'Salvar Pet'}</Button>
                </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
