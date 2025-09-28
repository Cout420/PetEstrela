

'use client';

import { useEffect, useState, useRef } from 'react';
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
import { LogOut, Users, FileText, Settings, Plus, Edit, Trash2, Save, Upload, X, QrCode, ImagePlus, CheckCircle2, HomeIcon, Building2, Heart } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { homePageContent as initialHomePageContent } from '@/lib/home-content';
import { ourSpaceContent as initialOurSpaceContent } from '@/lib/our-space-content';
import { memorialPageContent as initialMemorialPageContent } from '@/lib/memorial-content';
import { shortenLink } from '@/ai/flows/shorten-link-flow';
import { PROD_DOMAIN } from '@/lib/link-service';
import { getMemorials, saveMemorial, deleteMemorial, getNextMemorialId, PetMemorial as FirestorePetMemorial, PetMemorialWithDatesAsString, saveContent, getContent } from '@/lib/firebase-service';
import { Timestamp } from 'firebase/firestore';

// Zod schema for client-side form validation (dates are strings)
const petSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "O nome do pet é obrigatório."),
  species: z.string().min(1, "A raça é obrigatória."),
  sexo: z.string().min(1, "O sexo é obrigatório."),
  age: z.string().min(1, "A idade é obrigatória."),
  family: z.string().min(1, "A família é obrigatória."),
  birthDate: z.string().min(1, "A data de nascimento é obrigatória."),
  passingDate: z.string().min(1, "A data de falecimento é obrigatória."),
  arvore: z.string().min(1, "A árvore é obrigatória."),
  local: z.string().min(1, "O local é obrigatório."),
  tutores: z.string().min(1, "Os tutores são obrigatórios."),
  text: z.string().min(10, "O texto do memorial deve ter pelo menos 10 caracteres."),
  images: z.array(z.object({
      id: z.string(),
      imageUrl: z.string().min(1, "Por favor, selecione uma imagem."),
      description: z.string().optional(),
      imageHint: z.string().optional()
  })).min(5, "É necessário adicionar pelo menos 5 imagens."),
  qrCodeUrl: z.string().optional(),
  createdAt: z.custom<Timestamp>().optional(), // For internal use
});

type PetMemorialForm = z.infer<typeof petSchema>;


const aboutPageSchema = z.object({
  headerTitle: z.string().min(1, "Título é obrigatório."),
  headerDescription: z.string().min(1, "Descrição do cabeçalho é obrigatória."),
  missionTitle: z.string().min(1, "Título da missão é obrigatório."),
  missionDescription: z.string().min(1, "Descrição da missão é obrigatória."),
  missionImageUrl: z.string().min(1, "URL da imagem da missão é obrigatória."),
  historyTitle: z.string().min(1, "Título da história é obrigatório."),
  historyDescription: z.string().min(1, "Descrição da história é obrigatória."),
  historyImageUrl: z.string().min(1, "URL da imagem da história é obrigatória."),
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
    imageUrl: z.string(),
    title: z.string().min(1),
    subtitle: z.string().min(1),
});
const whyChooseUsItemSchema = z.object({
    icon: z.string(),
    title: z.string().min(1),
    description: z.string().min(1),
});
const cremationProcessStepSchema = z.object({
    step: z.string(),
    title: z.string().min(1),
    description: z.string().min(1),
});
const allPetsSectionSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    imageUrl: z.string(),
    petsList: z.array(z.string()),
});

const homePageSchema = z.object({
    heroSlides: z.array(heroSlideSchema),
    whyChooseUs: z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        items: z.array(whyChooseUsItemSchema),
    }),
    cremationProcess: z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        steps: z.array(cremationProcessStepSchema),
    }),
    allPetsSection: allPetsSectionSchema,
});

type HomePageContent = z.infer<typeof homePageSchema>;

const galleryItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Título da imagem é obrigatório."),
  imageUrl: z.string().min(1, "A imagem é obrigatória."),
});

const ourSpaceSchema = z.object({
  headerTitle: z.string().min(1, "Título é obrigatório."),
  headerDescription: z.string().min(1, "Descrição é obrigatória."),
  gallery: z.array(galleryItemSchema),
});

type OurSpaceContent = z.infer<typeof ourSpaceSchema>;


const memorialPageSchema = z.object({
  heroImageUrl: z.string().min(1, "A imagem é obrigatória."),
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
  const [pets, setPets] = useState<FirestorePetMemorial[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<FirestorePetMemorial | null>(null);
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
      name: '', species: '', sexo: '', age: '', family: '', birthDate: '', passingDate: '',
      arvore: '', local: '', tutores: '', text: '', images: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: petForm.control,
    name: "images"
  });
  
  const handlePetImageFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        petForm.setValue(`images.${index}.imageUrl`, reader.result as string, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenericFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: any, form: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue(fieldName, reader.result as string, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };


  const aboutForm = useForm<AboutPageContent>({
    resolver: zodResolver(aboutPageSchema),
    defaultValues: {
        headerTitle: "Sobre o Pet Estrela",
        headerDescription: "Há mais de 10 anos, nossa missão é proporcionar uma despedida digna e respeitosa, transformando a dor da perda em uma celebração do amor e da amizade.",
        missionTitle: "Nossa Missão",
        missionDescription: "Nossa missão é oferecer um serviço de cremação pet que transcenda o procedimento técnico. Buscamos acolher as famílias em um dos momentos mais delicados, garantindo que a memória de seus companheiros seja honrada com a máxima dignidade. Acreditamos que cada vida, não importa o quão pequena, merece uma despedida grandiosa.",
        missionImageUrl: PlaceHolderImages.find((img) => img.id === 'about-mission')?.imageUrl ?? '',
        historyTitle: "Nossa História",
        historyDescription: "Fundada em 2014 com o sonho de oferecer um serviço funerário pet diferenciado, a Pet Estrela nasceu da paixão e do respeito pelos animais. Ao longo dos anos, crescemos e nos modernizamos, mas nunca perdemos a essência do nosso trabalho: o acolhimento.",
        historyImageUrl: PlaceHolderImages.find((img) => img.id === 'about-history')?.imageUrl ?? '',
    }
  });
  
    const generalForm = useForm<GeneralContent>({
    resolver: zodResolver(generalContentSchema),
    defaultValues: {
      whatsappNumber: '1142405253',
      whatsappLink: 'https://wa.me/551142405253',
      phone: '(11) 4240-5253',
      address: 'Av. Adília Barbosa Neves, 2740, Centro Industrial, Arujá - SP, CEP: 07432-575',
      instagramLink: 'https://www.instagram.com/petestrelacrematorio/',
    }
  });

  const plansForm = useForm<PlansPageContent>({
    resolver: zodResolver(plansPageSchema),
    defaultValues: {
        plans: initialPlans,
    },
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

useEffect(() => {
    const loadContentFromDB = async () => {
      // Load About Page Content
      aboutForm.reset(initialHomePageContent as any); // Reset with initial data first
      const aboutData = await getContent<AboutPageContent>('aboutPageContent');
      if (aboutData) aboutForm.reset(aboutData);

      // Load General Content
      generalForm.reset({
        whatsappNumber: '1142405253',
        whatsappLink: 'https://wa.me/551142405253',
        phone: '(11) 4240-5253',
        address: 'Av. Adília Barbosa Neves, 2740, Centro Industrial, Arujá - SP, CEP: 07432-575',
        instagramLink: 'https://www.instagram.com/petestrelacrematorio/',
      });
      const generalData = await getContent<GeneralContent>('generalContent');
      if (generalData) generalForm.reset(generalData);

      // Load Plans Page Content
      plansForm.reset({ plans: initialPlans });
      const plansData = await getContent<PlansPageContent>('plansPageContent');
      if (plansData) plansForm.reset(plansData);

      // Load Home Page Content
      homeForm.reset(initialHomePageContent);
      const homeData = await getContent<HomePageContent>('homePageContent');
      if (homeData) homeForm.reset(homeData);

      // Load Our Space Content
      ourSpaceForm.reset(initialOurSpaceContent);
      const ourSpaceData = await getContent<OurSpaceContent>('ourSpaceContent');
      if (ourSpaceData) ourSpaceForm.reset(ourSpaceData);

      // Load Memorial Page Content
      memorialForm.reset(initialMemorialPageContent);
      const memorialData = await getContent<MemorialPageContent>('memorialPageContent');
      if (memorialData) memorialForm.reset(memorialData);
    };

    if (isAuthenticated) {
      loadContentFromDB();
    }
  }, [isAuthenticated, aboutForm, generalForm, plansForm, homeForm, ourSpaceForm, memorialForm]);

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
          arvore: '', local: '', tutores: '', text: '', images: Array(5).fill({ id: '', imageUrl: '' }),
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

  const handleOpenForm = (pet: FirestorePetMemorial | null) => {
    setEditingPet(pet);
    setIsFormOpen(true);
  };
  
  const handleSavePet = async (data: PetMemorialForm) => {
    try {
      const result = await shortenLink({ memorialId: data.id });
      data.qrCodeUrl = result.shortUrl;
    } catch (error) {
      console.error('Failed to shorten link, falling back to direct URL:', error);
      data.qrCodeUrl = `${PROD_DOMAIN}/memorial/${data.id}`;
    }

    const petToSave: PetMemorialWithDatesAsString = {
      ...data,
      createdAt: editingPet?.createdAt || Timestamp.now(),
    };

    try {
        await saveMemorial(petToSave);
        if (editingPet) {
            toast({ title: `Memorial de ${data.name} atualizado com sucesso.` });
        } else {
            toast({ title: `Memorial de ${data.name} criado com sucesso.` });
        }
        fetchPets(); // Refresh the list
        setIsFormOpen(false);
        setEditingPet(null);
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Erro ao salvar",
            description: "Não foi possível salvar o memorial. Tente novamente.",
        });
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
    try {
      await saveContent('aboutPageContent', data);
      toast({ title: 'Conteúdo da página "Sobre Nós" atualizado com sucesso.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao Salvar', description: 'Não foi possível salvar o conteúdo.' });
    }
  };
  
  const handleSaveHomeContent = async (data: HomePageContent) => {
    try {
      await saveContent('homePageContent', data);
      toast({ title: 'Conteúdo da página "Home" atualizado com sucesso.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao Salvar', description: 'Não foi possível salvar o conteúdo.' });
    }
  }

  const handleSaveGeneralContent = async (data: GeneralContent) => {
    try {
      await saveContent('generalContent', data);
      toast({ title: 'Conteúdo geral do site atualizado com sucesso.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao Salvar', description: 'Não foi possível salvar o conteúdo.' });
    }
  };
  
  const handleSavePlansContent = async (data: PlansPageContent) => {
    try {
      await saveContent('plansPageContent', data);
      toast({ title: 'Conteúdo da página de planos atualizado com sucesso.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao Salvar', description: 'Não foi possível salvar o conteúdo.' });
    }
  };

  const handleSaveOurSpaceContent = async (data: OurSpaceContent) => {
    try {
      await saveContent('ourSpaceContent', data);
      toast({ title: 'Conteúdo da página "Nosso Espaço" atualizado com sucesso.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao Salvar', description: 'Não foi possível salvar o conteúdo.' });
    }
  };

  const handleSaveMemorialPageContent = async (data: MemorialPageContent) => {
    try {
      await saveContent('memorialPageContent', data);
      toast({ title: 'Conteúdo da página "Memorial" atualizado com sucesso.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao Salvar', description: 'Não foi possível salvar o conteúdo.' });
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
                      <CardHeader><CardTitle>Carrossel Principal (Hero)</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        {heroSlidesFields.map((slide, index) => (
                          <div key={slide.id} className="space-y-2 rounded-md border p-4">
                            <h4 className="font-semibold">Slide {index + 1}</h4>
                            <FormField control={homeForm.control} name={`heroSlides.${index}.title`} render={({ field }) => (<FormItem><FormLabel>Título</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                            <FormField control={homeForm.control} name={`heroSlides.${index}.subtitle`} render={({ field }) => (<FormItem><FormLabel>Subtítulo</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                            <FormField control={homeForm.control} name={`heroSlides.${index}.imageUrl`} render={({ field: { onChange, value, ...rest } }) => (<FormItem><FormLabel>Imagem</FormLabel><FormControl><div><Input type="file" accept="image/*" onChange={(e) => handleGenericFileChange(e, `heroSlides.${index}.imageUrl`, homeForm)} /><Image src={value} alt="Preview" width={100} height={50} className='mt-2 rounded-md object-cover' /></div></FormControl></FormItem>)} />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                     {/* Why Choose Us */}
                    <Card className="p-4">
                        <CardHeader><CardTitle>Seção "Por que escolher?"</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                             <FormField control={homeForm.control} name="whyChooseUs.title" render={({ field }) => (<FormItem><FormLabel>Título da Seção</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                             <FormField control={homeForm.control} name="whyChooseUs.description" render={({ field }) => (<FormItem><FormLabel>Descrição da Seção</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>)} />
                             {homeForm.getValues('whyChooseUs.items').map((item, index) => (
                                 <div key={index} className="space-y-2 rounded-md border p-4">
                                     <h4 className="font-semibold">Item {index + 1}</h4>
                                     <FormField control={homeForm.control} name={`whyChooseUs.items.${index}.title`} render={({ field }) => (<FormItem><FormLabel>Título do Item</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                     <FormField control={homeForm.control} name={`whyChooseUs.items.${index}.description`} render={({ field }) => (<FormItem><FormLabel>Descrição do Item</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                 </div>
                             ))}
                        </CardContent>
                    </Card>

                     {/* Cremation Process */}
                     <Card className="p-4">
                         <CardHeader><CardTitle>Seção "Processo de Cremação"</CardTitle></CardHeader>
                         <CardContent className="space-y-4">
                              <FormField control={homeForm.control} name="cremationProcess.title" render={({ field }) => (<FormItem><FormLabel>Título da Seção</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                              <FormField control={homeForm.control} name="cremationProcess.description" render={({ field }) => (<FormItem><FormLabel>Descrição da Seção</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>)} />
                              {homeForm.getValues('cremationProcess.steps').map((step, index) => (
                                  <div key={index} className="space-y-2 rounded-md border p-4">
                                      <h4 className="font-semibold">Passo {step.step}</h4>
                                      <FormField control={homeForm.control} name={`cremationProcess.steps.${index}.title`} render={({ field }) => (<FormItem><FormLabel>Título do Passo</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                      <FormField control={homeForm.control} name={`cremationProcess.steps.${index}.description`} render={({ field }) => (<FormItem><FormLabel>Descrição do Passo</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>)} />
                                  </div>
                              ))}
                         </CardContent>
                     </Card>

                     {/* All Pets Section */}
                    <Card className="p-4">
                        <CardHeader><CardTitle>Seção "Todos os Pets"</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <FormField control={homeForm.control} name="allPetsSection.title" render={({ field }) => (<FormItem><FormLabel>Título da Seção</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                            <FormField control={homeForm.control} name="allPetsSection.description" render={({ field }) => (<FormItem><FormLabel>Descrição da Seção</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>)} />
                            <FormField control={homeForm.control} name="allPetsSection.imageUrl" render={({ field: { onChange, value, ...rest } }) => (<FormItem><FormLabel>Imagem da Seção</FormLabel><FormControl><div><Input type="file" accept="image/*" onChange={(e) => handleGenericFileChange(e, 'allPetsSection.imageUrl', homeForm)} /><Image src={value} alt="Preview" width={100} height={50} className='mt-2 rounded-md object-cover' /></div></FormControl></FormItem>)} />
                        </CardContent>
                    </Card>

                    <Button type="submit"><Save className="mr-2" /> Salvar Página Home</Button>
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
                            <FormField control={memorialForm.control} name="heroImageUrl" render={({ field: { onChange, value, ...rest } }) => (<FormItem><FormLabel>Imagem de Fundo</FormLabel><FormControl><div><Input type="file" accept="image/*" onChange={(e) => handleGenericFileChange(e, `heroImageUrl`, memorialForm)} /><Image src={value} alt="Preview" width={100} height={50} className='mt-2 rounded-md object-cover' /></div></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={memorialForm.control} name="heroTitle" render={({ field }) => (<FormItem><FormLabel>Título</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={memorialForm.control} name="heroDescription1" render={({ field }) => (<FormItem><FormLabel>Descrição (Parágrafo 1)</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={memorialForm.control} name="heroDescription2" render={({ field }) => (<FormItem><FormLabel>Descrição (Parágrafo 2)</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl><FormMessage /></FormItem>)} />

                            <h3 className="text-lg font-semibold text-primary mt-6">Card "Criar Memorial"</h3>
                            <FormField control={memorialForm.control} name="createMemorialTitle" render={({ field }) => (<FormItem><FormLabel>Título do Card</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={memorialForm.control} name="createMemorialDescription" render={({ field }) => (<FormItem><FormLabel>Descrição do Card</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />

                            <Button type="submit"><Save className="mr-2" /> Salvar Página Memorial</Button>
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
                      {pet.images && pet.images.length > 0 && (
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
                            <FormField control={aboutForm.control} name="missionImageUrl" render={({ field: { onChange, value, ...rest } }) => (<FormItem><FormLabel>Imagem da Missão</FormLabel><FormControl><div><Input type="file" accept="image/*" onChange={(e) => handleGenericFileChange(e, 'missionImageUrl', aboutForm)} /><Image src={value} alt="Preview" width={100} height={50} className='mt-2 rounded-md object-cover' /></div></FormControl><FormMessage /></FormItem>)} />

                            <h3 className="text-lg font-semibold text-primary mt-6">Seção História</h3>
                             <FormField control={aboutForm.control} name="historyTitle" render={({ field }) => (<FormItem><FormLabel>Título da História</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={aboutForm.control} name="historyDescription" render={({ field }) => (<FormItem><FormLabel>Descrição da História</FormLabel><FormControl><Textarea {...field} rows={4} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={aboutForm.control} name="historyImageUrl" render={({ field: { onChange, value, ...rest } }) => (<FormItem><FormLabel>Imagem da História</FormLabel><FormControl><div><Input type="file" accept="image/*" onChange={(e) => handleGenericFileChange(e, 'historyImageUrl', aboutForm)} /><Image src={value} alt="Preview" width={100} height={50} className='mt-2 rounded-md object-cover' /></div></FormControl><FormMessage /></FormItem>)} />

                            <Button type="submit"><Save className="mr-2" /> Salvar Alterações</Button>
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
                                <CardHeader><CardTitle>Galeria de Imagens</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    {galleryFields.map((item, index) => (
                                        <div key={item.id} className="space-y-2 rounded-md border p-4">
                                            <h4 className="font-semibold">Imagem {index + 1}</h4>
                                            <FormField control={ourSpaceForm.control} name={`gallery.${index}.title`} render={({ field }) => (<FormItem><FormLabel>Título da Imagem</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                            <FormField control={ourSpaceForm.control} name={`gallery.${index}.imageUrl`} render={({ field: { onChange, value, ...rest } }) => (<FormItem><FormLabel>Arquivo da Imagem</FormLabel><FormControl><div><Input type="file" accept="image/*" onChange={(e) => handleGenericFileChange(e, `gallery.${index}.imageUrl`, ourSpaceForm)} /><Image src={value} alt="Preview" width={100} height={75} className='mt-2 rounded-md object-cover' /></div></FormControl></FormItem>)} />
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            <Button type="submit"><Save className="mr-2" /> Salvar Página "Nosso Espaço"</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
          </TabsContent>


          <TabsContent value="plans" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Editar Página de Planos</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...plansForm}>
                        <form onSubmit={plansForm.handleSubmit(handleSavePlansContent)} className="space-y-8">
                            {planFields.map((plan, planIndex) => (
                                <Card key={plan.id} className="p-4 border-primary/20">
                                    <CardHeader>
                                        <CardTitle>Plano {planIndex + 1}</CardTitle>
                                    </CardHeader>
                                    <CardContent className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                        <FormField control={plansForm.control} name={`plans.${planIndex}.name`} render={({ field }) => (<FormItem><FormLabel>Nome do Plano</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={plansForm.control} name={`plans.${planIndex}.price`} render={({ field }) => (<FormItem><FormLabel>Preço</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={plansForm.control} name={`plans.${planIndex}.description`} render={({ field }) => (<FormItem className="col-span-1 md:col-span-2"><FormLabel>Descrição</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                                        
                                        <div className='col-span-1 md:col-span-2'>
                                            <Label>Características</Label>
                                            <div className="space-y-2 mt-2">
                                                {plan.features.map((_, featureIndex) => (
                                                    <FormField key={featureIndex} control={plansForm.control} name={`plans.${planIndex}.features.${featureIndex}`} render={({ field }) => (
                                                        <FormItem><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                                    )} />
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <FormField control={plansForm.control} name={`plans.${planIndex}.optional`} render={({ field }) => (<FormItem className="col-span-1 md:col-span-2"><FormLabel>Texto Opcional</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    </CardContent>
                                </Card>
                            ))}
                            <Button type="submit"><Save className="mr-2" /> Salvar Planos</Button>
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
                    <Button type="submit"><Save className="mr-2" /> Salvar Conteúdo Geral</Button>
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
                        <Label>Fotos (Mínimo 5)</Label>
                         <p className="text-sm text-muted-foreground">Anexe as imagens. A primeira será a foto de capa.</p>
                         <div className="mt-2 space-y-2">
                         {fields.map((field, index) => (
                             <div key={field.id} className="flex items-center gap-2">
                                 <FormField
                                     control={petForm.control}
                                     name={`images.${index}.imageUrl`}
                                     render={({ field: { onChange, value, ...rest } }) => (
                                         <FormItem className="flex-1">
                                             <FormControl>
                                                <div className='flex items-center gap-2'>
                                                    <Input 
                                                        type="file" 
                                                        accept="image/*"
                                                        onChange={(e) => handlePetImageFileChange(e, index)}
                                                        className="w-full"
                                                    />
                                                    {value && typeof value === 'string' && (
                                                      <Image src={value} alt={`Preview ${index + 1}`} width={40} height={40} className="rounded-md object-cover" />
                                                    )}
                                                </div>
                                             </FormControl>
                                             <FormMessage />
                                         </FormItem>
                                     )}
                                 />
                                <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
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
                            onClick={() => append({ id: `img-${Date.now()}`, imageUrl: '' })}
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
                    <Button type="submit">Salvar Pet</Button>
                </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}


    

    
