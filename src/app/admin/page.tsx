
'use client';

import { useState, useEffect, useCallback, useRef, Fragment } from 'react';
import { useForm, FormProvider, useFieldArray, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { getContent, saveContent, uploadFile } from '@/lib/firebase-service';
import { homePageContent as initialHomePageContent } from '@/lib/home-content';
import { aboutPageContent as initialAboutContent } from '@/lib/about-content';
import { memorialPageContent as initialMemorialContent } from '@/lib/memorial-content';
import { ourSpaceContent as initialOurSpaceContent } from '@/lib/our-space-content';
import { plans as initialPlans } from '@/lib/mock-data';
import { Loader2, PlusCircle, Trash2, Upload, Paperclip } from 'lucide-react';
import { getAdminApp } from '@/lib/firebase-admin';
import { Progress } from '@/components/ui/progress';

// --- Image Upload Component ---
const ImageUploadField = ({ name, label }: { name: string, label: string }) => {
  const { control, setValue, watch } = useFormContext();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageUrl = watch(name);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => (prev < 90 ? prev + 10 : prev));
      }, 200);

      const downloadURL = await uploadFile(file, 'site-content/');
      
      clearInterval(progressInterval);
      setProgress(100);
      setValue(name, downloadURL, { shouldValidate: true });
      
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setTimeout(() => {
        setUploading(false);
      }, 1000)
    }
  };

  return (
    <div className="space-y-2">
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <div className="flex items-center gap-2">
              <Input {...field} placeholder="https://..." value={field.value || ''} />
              <Button type="button" variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
            </div>
             <FormMessage />
          </FormItem>
        )}
      />
      {uploading && <Progress value={progress} className="w-full h-2" />}
      {imageUrl && !uploading && <img src={imageUrl} alt="preview" className="mt-2 h-20 w-auto rounded-md object-cover" />}
    </div>
  );
};


// --- Zod Schemas ---
const heroSlideSchema = z.object({
  imageUrl: z.string().url('URL inválida'),
  title: z.string().min(1, 'Título é obrigatório'),
  subtitle: z.string(),
});

const whyChooseUsItemSchema = z.object({
  icon: z.string(),
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string(),
});

const processStepSchema = z.object({
  step: z.string(),
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string(),
});

const allPetsSectionSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string(),
  imageUrl: z.string().url('URL inválida'),
  petsList: z.array(z.string()),
});

const homeContentSchema = z.object({
  heroSlides: z.array(heroSlideSchema),
  whyChooseUs: z.object({
    title: z.string(),
    description: z.string(),
    items: z.array(whyChooseUsItemSchema),
  }),
  cremationProcess: z.object({
    title: z.string(),
    description: z.string(),
    steps: z.array(processStepSchema),
  }),
  allPetsSection: allPetsSectionSchema,
});

const aboutContentSchema = z.object({
  headerTitle: z.string(),
  headerDescription: z.string(),
  missionTitle: z.string(),
  missionDescription: z.string(),
  missionImageUrl: z.string().url('URL inválida'),
  historyTitle: z.string(),
  historyDescription: z.string(),
  historyImageUrl: z.string().url('URL inválida'),
});

const memorialContentSchema = z.object({
  heroImageUrl: z.string().url('URL inválida'),
  heroTitle: z.string(),
  heroDescription1: z.string(),
  heroDescription2: z.string(),
  createMemorialTitle: z.string(),
  createMemorialDescription: z.string(),
});

const galleryItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  imageUrl: z.string().url('URL inválida'),
});

const ourSpaceContentSchema = z.object({
  headerTitle: z.string(),
  headerDescription: z.string(),
  gallery: z.array(galleryItemSchema),
});

const planFeatureSchema = z.string();

const planSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  price: z.string().min(1, "Preço é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  features: z.array(planFeatureSchema),
  pricingDetails: z.array(z.string()).optional(),
  optional: z.string().optional(),
  isMostChosen: z.boolean(),
});

const plansContentSchema = z.object({
  plans: z.array(planSchema),
});

const generalContentSchema = z.object({
  whatsappLink: z.string().url(),
  whatsappNumber: z.string(),
  phone: z.string(),
  address: z.string(),
  instagramLink: z.string().url(),
});

type CombinedSchemaType = z.infer<typeof homeContentSchema> &
  z.infer<typeof aboutContentSchema> &
  z.infer<typeof memorialContentSchema> &
  z.infer<typeof ourSpaceContentSchema> &
  z.infer<typeof plansContentSchema> &
  z.infer<typeof generalContentSchema>;


const AdminPage = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');

  const form = useForm({
    // We will set the resolver dynamically
    defaultValues: {
      ...initialHomePageContent,
      ...initialAboutContent,
      ...initialMemorialContent,
      ...initialOurSpaceContent,
      plans: initialPlans,
      whatsappLink: 'https://wa.me/551142405253',
      whatsappNumber: '1142405253',
      phone: '(11) 4240-5253',
      address: 'Av. Adília Barbosa Neves, 2740, Centro Industrial, Arujá - SP, CEP: 07432-575',
      instagramLink: 'https://www.instagram.com/petestrelacrematorio/',
    },
  });

  const { fields: heroSlidesFields, append: appendHeroSlide, remove: removeHeroSlide } = useFieldArray({ control: form.control, name: 'heroSlides' });
  const { fields: whyChooseUsItemsFields, append: appendWhyChooseUsItem, remove: removeWhyChooseUsItem } = useFieldArray({ control: form.control, name: 'whyChooseUs.items' });
  const { fields: processStepsFields, append: appendProcessStep, remove: removeProcessStep } = useFieldArray({ control: form.control, name: 'cremationProcess.steps' });
  const { fields: galleryItemsFields, append: appendGalleryItem, remove: removeGalleryItem } = useFieldArray({ control: form.control, name: 'gallery' });
  const { fields: plansFields, append: appendPlan, remove: removePlan } = useFieldArray({ control: form.control, name: 'plans' });

  const schemaMap = {
    home: homeContentSchema,
    about: aboutContentSchema,
    memorial: memorialContentSchema,
    ourSpace: ourSpaceContentSchema,
    plans: plansContentSchema,
    general: generalContentSchema,
  };
  
  type SchemaMapKeys = keyof typeof schemaMap;

  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      try {
        const [homeData, aboutData, memorialData, ourSpaceData, plansData, generalData] = await Promise.all([
          getContent('homePageContent'),
          getContent('aboutPageContent'),
          getContent('memorialPageContent'),
          getContent('ourSpaceContent'),
          getContent('plansPageContent'),
          getContent('generalContent'),
        ]);
        
        const mergedData = {
          ...initialHomePageContent,
          ...(homeData as any),
          ...initialAboutContent,
          ...(aboutData as any),
          ...initialMemorialContent,
          ...(memorialData as any),
          ...initialOurSpaceContent,
          ...(ourSpaceData as any),
          plans: (plansData as any)?.plans || initialPlans,
          whatsappLink: (generalData as any)?.whatsappLink || 'https://wa.me/551142405253',
          whatsappNumber: (generalData as any)?.whatsappNumber || '1142405253',
          phone: (generalData as any)?.phone || '(11) 4240-5253',
          address: (generalData as any)?.address || 'Av. Adília Barbosa Neves, 2740, Centro Industrial, Arujá - SP, CEP: 07432-575',
          instagramLink: (generalData as any)?.instagramLink || 'https://www.instagram.com/petestrelacrematorio/',
        };

        form.reset(mergedData);

      } catch (error) {
        toast({ title: 'Erro ao carregar conteúdo', description: (error as Error).message, variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [form, toast]);


  const onSubmit = async (data: any) => {
    try {
        const contentIdMap = {
            home: 'homePageContent',
            about: 'aboutPageContent',
            memorial: 'memorialPageContent',
            ourSpace: 'ourSpaceContent',
            plans: 'plansPageContent',
            general: 'generalContent',
        };
        const contentId = contentIdMap[activeTab as SchemaMapKeys];
        
        let dataToSave: { [key: string]: any } = {};

        if (activeTab === 'plans') {
            dataToSave = { plans: data.plans };
        } else if (activeTab === 'general') {
             dataToSave = {
                whatsappLink: data.whatsappLink,
                whatsappNumber: data.whatsappNumber,
                phone: data.phone,
                address: data.address,
                instagramLink: data.instagramLink
             };
        } 
        else {
            const currentSchema = schemaMap[activeTab as SchemaMapKeys];
            const fieldsForCurrentTab = Object.keys(currentSchema.shape);
            fieldsForCurrentTab.forEach(field => {
                if (data[field] !== undefined) {
                    dataToSave[field] = data[field];
                }
            });
        }
        
        await saveContent(contentId, dataToSave);

        toast({ title: 'Sucesso!', description: `Conteúdo da aba '${activeTab}' salvo com sucesso.` });
    } catch (error) {
        toast({ title: 'Erro ao salvar', description: (error as Error).message, variant: 'destructive' });
    }
  };

  const renderArrayField = (
    title: string,
    fieldArray: any[],
    appendFn: (value: any) => void,
    removeFn: (index: number) => void,
    fieldSchema: z.ZodRawShape,
    namePrefix: string
    ) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {fieldArray.map((field: any, index: number) => (
          <Card key={field.id} className="p-4">
            <div className="space-y-2">
              {Object.keys(fieldSchema).map(key => {
                 if (key === 'imageUrl' || key.toLowerCase().includes('imageurl')) {
                   const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                   return <ImageUploadField key={key} name={`${namePrefix}.${index}.${key}`} label={label} />;
                 }
                 if (key !== 'isMostChosen' && key !== 'id') {
                    return (
                        <FormField
                        key={key}
                        control={form.control}
                        name={`${namePrefix}.${index}.${key}`}
                        render={({ field: formField }) => (
                            <FormItem>
                            <FormLabel>{key.charAt(0).toUpperCase() + key.slice(1)}</FormLabel>
                            <FormControl>
                                {key === 'features' || key === 'pricingDetails' ? (
                                    <Textarea {...formField} value={(formField.value || []).join('\n')} onChange={e => formField.onChange(e.target.value.split('\n'))} />
                                ) : (
                                    <Input {...formField} value={formField.value || ''}/>
                                )}
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    )
                 }
                 return null;
              })}
               {fieldSchema.isMostChosen !== undefined && (
                 <FormField
                  control={form.control}
                  name={`${namePrefix}.${index}.isMostChosen`}
                  render={({ field: formField }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm mt-2">
                      <FormLabel>É o mais escolhido?</FormLabel>
                      <FormControl>
                        <input type="checkbox" checked={formField.value} onChange={formField.onChange} className="h-4 w-4" />
                      </FormControl>
                    </FormItem>
                  )}
                />
               )}

            </div>
            <Button variant="destructive" size="sm" onClick={() => removeFn(index)} className="mt-2">
              <Trash2 className="mr-2 h-4 w-4" /> Remover
            </Button>
          </Card>
        ))}
        <Button onClick={() => {
            const newObject = Object.keys(fieldSchema).reduce((acc, key) => {
                if(key === 'id') {
                    // @ts-ignore
                    acc[key] = `new_${Date.now()}`;
                } else if (fieldSchema[key] instanceof z.ZodArray) {
                    // @ts-ignore
                    acc[key] = [];
                } else if (fieldSchema[key] instanceof z.ZodBoolean) {
                    // @ts-ignore
                    acc[key] = false;
                }
                else {
                    // @ts-ignore
                    acc[key] = '';
                }
                return acc;
            }, {});
            appendFn(newObject);
        }}>
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar
        </Button>
      </CardContent>
    </Card>
  );

  const renderSimpleField = (name: string, label: string, type: 'input' | 'textarea' = 'input') => {
      const Component = type === 'input' ? Input : Textarea;
      return (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                        <Component {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
      );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold">Gerenciador de Conteúdo do Site</h1>
      <p className="text-muted-foreground">Edite o conteúdo das páginas do seu site.</p>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin" />
        </div>
      ) : (
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
              <TabsList>
                <TabsTrigger value="home">Home</TabsTrigger>
                <TabsTrigger value="about">Sobre Nós</TabsTrigger>
                <TabsTrigger value="memorial">Memorial</TabsTrigger>
                <TabsTrigger value="ourSpace">Nosso Espaço</TabsTrigger>
                <TabsTrigger value="plans">Planos</TabsTrigger>
                <TabsTrigger value="general">Geral</TabsTrigger>
              </TabsList>
              
              <TabsContent value="home" className="space-y-6">
                 {renderArrayField('Slides do Herói', heroSlidesFields, appendHeroSlide, removeHeroSlide, heroSlideSchema.shape, 'heroSlides')}
                 <Card>
                    <CardHeader><CardTitle>Seção "Por Que Escolher-nos?"</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {renderSimpleField('whyChooseUs.title', 'Título', 'input')}
                        {renderSimpleField('whyChooseUs.description', 'Descrição', 'textarea')}
                    </CardContent>
                 </Card>
                 {renderArrayField('Itens "Por Que Escolher-nos?"', whyChooseUsItemsFields, appendWhyChooseUsItem, removeWhyChooseUsItem, whyChooseUsItemSchema.shape, 'whyChooseUs.items')}
                 <Card>
                    <CardHeader><CardTitle>Seção "Processo de Cremação"</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {renderSimpleField('cremationProcess.title', 'Título', 'input')}
                        {renderSimpleField('cremationProcess.description', 'Descrição', 'textarea')}
                    </CardContent>
                 </Card>
                 {renderArrayField('Passos do Processo', processStepsFields, appendProcessStep, removeProcessStep, processStepSchema.shape, 'cremationProcess.steps')}
                 <Card>
                    <CardHeader><CardTitle>Seção "Todos os Pets"</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {renderSimpleField('allPetsSection.title', 'Título', 'input')}
                        {renderSimpleField('allPetsSection.description', 'Descrição', 'textarea')}
                        <ImageUploadField name="allPetsSection.imageUrl" label="Imagem de Fundo da Seção" />
                        <FormField 
                          control={form.control}
                          name="allPetsSection.petsList"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Lista de Pets (um por linha)</FormLabel>
                              <FormControl>
                                <Textarea {...field} value={(field.value || []).join('\n')} onChange={(e) => field.onChange(e.target.value.split('\n'))} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                    </CardContent>
                 </Card>
              </TabsContent>

              <TabsContent value="about" className="space-y-6">
                <Card><CardHeader><CardTitle>Conteúdo "Sobre Nós"</CardTitle></CardHeader><CardContent className="space-y-4">
                  {renderSimpleField("headerTitle", "Título do Cabeçalho")}
                  {renderSimpleField("headerDescription", "Descrição do Cabeçalho", "textarea")}
                  {renderSimpleField("missionTitle", "Título da Missão")}
                  {renderSimpleField("missionDescription", "Descrição da Missão", "textarea")}
                  <ImageUploadField name="missionImageUrl" label="Imagem da Missão" />
                  {renderSimpleField("historyTitle", "Título da História")}
                  {renderSimpleField("historyDescription", "Descrição da História", "textarea")}
                  <ImageUploadField name="historyImageUrl" label="Imagem da História" />
                </CardContent></Card>
              </TabsContent>

              <TabsContent value="memorial" className="space-y-6">
                <Card><CardHeader><CardTitle>Conteúdo da Página Memorial</CardTitle></CardHeader><CardContent className="space-y-4">
                   <ImageUploadField name="heroImageUrl" label="Imagem de Fundo do Herói" />
                   {renderSimpleField("heroTitle", "Título do Herói")}
                   {renderSimpleField("heroDescription1", "Descrição do Herói (Parágrafo 1)", "textarea")}
                   {renderSimpleField("heroDescription2", "Descrição do Herói (Parágrafo 2)", "textarea")}
                   {renderSimpleField("createMemorialTitle", "Título do Card 'Criar Memorial'")}
                   {renderSimpleField("createMemorialDescription", "Descrição do Card 'Criar Memorial'", "textarea")}
                </CardContent></Card>
              </TabsContent>

               <TabsContent value="ourSpace" className="space-y-6">
                <Card>
                    <CardHeader><CardTitle>Cabeçalho da Página "Nosso Espaço"</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {renderSimpleField('headerTitle', 'Título do Cabeçalho')}
                        {renderSimpleField('headerDescription', 'Descrição do Cabeçalho', 'textarea')}
                    </CardContent>
                </Card>
                 {renderArrayField('Itens da Galeria', galleryItemsFields, appendGalleryItem, removeGalleryItem, galleryItemSchema.shape, 'gallery')}
              </TabsContent>

              <TabsContent value="plans" className="space-y-6">
                  {renderArrayField('Planos', plansFields, appendPlan, removePlan, planSchema.shape, 'plans')}
              </TabsContent>
              
              <TabsContent value="general" className="space-y-6">
                 <Card><CardHeader><CardTitle>Configurações Gerais</CardTitle></CardHeader><CardContent className="space-y-4">
                   {renderSimpleField("whatsappLink", "Link do WhatsApp")}
                   {renderSimpleField("whatsappNumber", "Número do WhatsApp (texto)")}
                   {renderSimpleField("phone", "Telefone (texto)")}
                   {renderSimpleField("address", "Endereço", "textarea")}
                   {renderSimpleField("instagramLink", "Link do Instagram")}
                </CardContent></Card>
              </TabsContent>
            </Tabs>

            <div className="mt-8 flex justify-end">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Conteúdo da Aba
              </Button>
            </div>
          </form>
        </FormProvider>
      )}
    </div>
  );
};

export default AdminPage;

    