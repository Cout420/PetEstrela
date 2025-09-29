'use client';

import { useState } from 'react';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { homePageContent as initialHomePageContent } from '@/lib/home-content';
import { aboutPageContent as initialAboutContent } from '@/lib/about-content';
import { ourSpaceContent as initialOurSpaceContent } from '@/lib/our-space-content';
import { plans } from '@/lib/mock-data';
import { memorialPageContent } from '@/lib/memorial-content';

// Zod Schemas for each content type
const heroSlideSchema = z.object({
  imageUrl: z.string().url(),
  title: z.string(),
  subtitle: z.string(),
});

const whyChooseUsItemSchema = z.object({
  icon: z.string(),
  title: z.string(),
  description: z.string(),
});

const processStepSchema = z.object({
  step: z.string(),
  title: z.string(),
  description: z.string(),
});

const homePageSchema = z.object({
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
  allPetsSection: z.object({
    title: z.string(),
    description: z.string(),
    imageUrl: z.string().url(),
    petsList: z.array(z.string()),
  }),
});

const aboutPageSchema = z.object({
  headerTitle: z.string(),
  headerDescription: z.string(),
  missionTitle: z.string(),
  missionDescription: z.string(),
  missionImageUrl: z.string().url(),
  historyTitle: z.string(),
  historyDescription: z.string(),
  historyImageUrl: z.string().url(),
});

const galleryItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  imageUrl: z.string().url(),
});

const ourSpacePageSchema = z.object({
  headerTitle: z.string(),
  headerDescription: z.string(),
  gallery: z.array(galleryItemSchema),
});

const planFeatureSchema = z.string();

const planSchema = z.object({
  name: z.string(),
  price: z.string(),
  description: z.string(),
  features: z.array(planFeatureSchema),
  isMostChosen: z.boolean(),
  pricingDetails: z.array(z.string()).optional(),
  optional: z.string().optional(),
});

const plansPageSchema = z.object({
  plans: z.array(planSchema),
});

const memorialPageSchema = z.object({
    heroImageUrl: z.string(),
    heroTitle: z.string(),
    heroDescription1: z.string(),
    heroDescription2: z.string(),
    createMemorialTitle: z.string(),
    createMemorialDescription: z.string(),
})

const generalContentSchema = z.object({
    whatsappLink: z.string().url(),
    whatsappNumber: z.string(),
    phone: z.string(),
    address: z.string(),
    instagramLink: z.string().url(),
})

const AdminPage = () => {
  const { toast } = useToast();

  const homeForm = useForm({
    resolver: zodResolver(homePageSchema),
    defaultValues: initialHomePageContent,
  });

  const aboutForm = useForm({
    resolver: zodResolver(aboutPageSchema),
    defaultValues: initialAboutContent,
  });

  const ourSpaceForm = useForm({
    resolver: zodResolver(ourSpacePageSchema),
    defaultValues: initialOurSpaceContent,
  });

  const plansForm = useForm({
      resolver: zodResolver(plansPageSchema),
      defaultValues: { plans: plans }
  })

  const memorialForm = useForm({
      resolver: zodResolver(memorialPageSchema),
      defaultValues: memorialPageContent
  })

  const generalForm = useForm({
      resolver: zodResolver(generalContentSchema),
      defaultValues: {
        whatsappLink: 'https://wa.me/551142405253',
        whatsappNumber: '1142405253',
        phone: '(11) 4240-5253',
        address: 'Av. Adília Barbosa Neves, 2740, Centro Industrial, Arujá - SP, CEP: 07432-575',
        instagramLink: 'https://www.instagram.com/petestrelacrematorio/',
      }
  })

  const onSubmit = async (data: any, contentId: string) => {
    toast({
      title: `Salvando ${contentId}...`,
      description: 'Aguarde enquanto os dados são enviados.',
    });
    try {
    //   await saveContent(contentId, data);
      toast({
        title: 'Sucesso!',
        description: `Conteúdo da página "${contentId}" salvo com sucesso.`,
      });
    } catch (error) {
      toast({
        title: 'Erro ao salvar!',
        description: `Não foi possível salvar o conteúdo. Erro: ${(error as Error).message}`,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Painel Administrativo</h1>
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="home">Home</TabsTrigger>
          <TabsTrigger value="memorial">Memorial</TabsTrigger>
          <TabsTrigger value="plans">Planos</TabsTrigger>
          <TabsTrigger value="about">Sobre Nós</TabsTrigger>
          <TabsTrigger value="our-space">Nosso Espaço</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
            <FormProvider {...generalForm}>
                 <form onSubmit={generalForm.handleSubmit(data => onSubmit(data, 'generalContent'))}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Conteúdo Geral</CardTitle>
                            <CardDescription>Links e informações que aparecem em todo o site.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField name="whatsappLink" render={({field}) => <FormItem><FormLabel>Link do WhatsApp</FormLabel><Input {...field} /><FormMessage/></FormItem>} />
                            <FormField name="whatsappNumber" render={({field}) => <FormItem><FormLabel>Número do WhatsApp (texto)</FormLabel><Input {...field} /><FormMessage/></FormItem>} />
                            <FormField name="phone" render={({field}) => <FormItem><FormLabel>Telefone (texto)</FormLabel><Input {...field} /><FormMessage/></FormItem>} />
                            <FormField name="address" render={({field}) => <FormItem><FormLabel>Endereço</FormLabel><Textarea {...field} /><FormMessage/></FormItem>} />
                            <FormField name="instagramLink" render={({field}) => <FormItem><FormLabel>Link do Instagram</FormLabel><Input {...field} /><FormMessage/></FormItem>} />
                        </CardContent>
                    </Card>
                    <Button type="submit" className="mt-4">Salvar Conteúdo Geral</Button>
                </form>
            </FormProvider>
        </TabsContent>

        <TabsContent value="home">
          <FormProvider {...homeForm}>
            <form onSubmit={homeForm.handleSubmit(data => onSubmit(data, 'homePageContent'))} className="space-y-6">
              {/* Hero Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Seção Herói</CardTitle>
                </CardHeader>
                <CardContent>
                  <FieldArrayComponent name="heroSlides" form={homeForm} fieldsConfig={{
                    imageUrl: 'URL da Imagem',
                    title: 'Título',
                    subtitle: 'Subtítulo',
                  }} />
                </CardContent>
              </Card>

              {/* Why Choose Us */}
              <Card>
                <CardHeader>
                  <CardTitle>Por que nos escolher?</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField name="whyChooseUs.title" render={({field}) => <FormItem><FormLabel>Título</FormLabel><Input {...field} /></FormItem>} />
                  <FormField name="whyChooseUs.description" render={({field}) => <FormItem><FormLabel>Descrição</FormLabel><Textarea {...field} /></FormItem>} />
                  <h3 className="font-semibold mt-4">Itens</h3>
                   <FieldArrayComponent name="whyChooseUs.items" form={homeForm} fieldsConfig={{
                    icon: 'Ícone (nome do Lucide)',
                    title: 'Título',
                    description: 'Descrição',
                  }} />
                </CardContent>
              </Card>

              {/* Process Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Nosso Processo</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField name="cremationProcess.title" render={({field}) => <FormItem><FormLabel>Título</FormLabel><Input {...field} /></FormItem>} />
                  <FormField name="cremationProcess.description" render={({field}) => <FormItem><FormLabel>Descrição</FormLabel><Textarea {...field} /></FormItem>} />
                  <h3 className="font-semibold mt-4">Passos</h3>
                  <FieldArrayComponent name="cremationProcess.steps" form={homeForm} fieldsConfig={{
                    step: 'Passo (ex: 01)',
                    title: 'Título',
                    description: 'Descrição',
                  }} />
                </CardContent>
              </Card>

              <Button type="submit">Salvar Página Home</Button>
            </form>
          </FormProvider>
        </TabsContent>
        <TabsContent value="memorial">
             <FormProvider {...memorialForm}>
                <form onSubmit={memorialForm.handleSubmit(data => onSubmit(data, 'memorialPageContent'))} className="space-y-6">
                     <Card>
                        <CardHeader>
                            <CardTitle>Página do Memorial</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField name="heroImageUrl" render={({ field }) => <FormItem><FormLabel>URL Imagem de Fundo</FormLabel><Input {...field} /></FormItem>} />
                            <FormField name="heroTitle" render={({ field }) => <FormItem><FormLabel>Título Principal</FormLabel><Input {...field} /></FormItem>} />
                            <FormField name="heroDescription1" render={({ field }) => <FormItem><FormLabel>Parágrafo 1</FormLabel><Textarea {...field} /></FormItem>} />
                            <FormField name="heroDescription2" render={({ field }) => <FormItem><FormLabel>Parágrafo 2</FormLabel><Textarea {...field} /></FormItem>} />
                            <FormField name="createMemorialTitle" render={({ field }) => <FormItem><FormLabel>Título do Card "Criar Memorial"</FormLabel><Input {...field} /></FormItem>} />
                            <FormField name="createMemorialDescription" render={({ field }) => <FormItem><FormLabel>Descrição do Card "Criar Memorial"</FormLabel><Textarea {...field} /></FormItem>} />
                        </CardContent>
                     </Card>
                     <Button type="submit">Salvar Página Memorial</Button>
                </form>
            </FormProvider>
        </TabsContent>
        <TabsContent value="plans">
             <FormProvider {...plansForm}>
                <form onSubmit={plansForm.handleSubmit(data => onSubmit(data, 'plansPageContent'))} className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Planos</CardTitle></CardHeader>
                        <CardContent>
                            <FieldArrayComponent name="plans" form={plansForm} fieldsConfig={{
                                name: "Nome do Plano",
                                price: "Preço (texto)",
                                description: "Descrição",
                                features: "Itens Inclusos (separados por vírgula)",
                                isMostChosen: "É o mais escolhido? (true/false)",
                                pricingDetails: "Detalhes de Preço (opcional, um por linha)",
                                optional: "Texto Opcional (opcional)"
                            }} textAreaFields={['features', 'pricingDetails']} />
                        </CardContent>
                    </Card>
                    <Button type="submit">Salvar Planos</Button>
                </form>
             </FormProvider>
        </TabsContent>
        <TabsContent value="about">
          <FormProvider {...aboutForm}>
            <form onSubmit={aboutForm.handleSubmit(data => onSubmit(data, 'aboutPageContent'))} className="space-y-4">
                <Card>
                    <CardHeader><CardTitle>Página Sobre Nós</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <FormField name="headerTitle" render={({ field }) => <FormItem><FormLabel>Título do Cabeçalho</FormLabel><Input {...field} /></FormItem>} />
                        <FormField name="headerDescription" render={({ field }) => <FormItem><FormLabel>Descrição do Cabeçalho</FormLabel><Textarea {...field} /></FormItem>} />
                        <FormField name="missionTitle" render={({ field }) => <FormItem><FormLabel>Título da Missão</FormLabel><Input {...field} /></FormItem>} />
                        <FormField name="missionDescription" render={({ field }) => <FormItem><FormLabel>Descrição da Missão</FormLabel><Textarea {...field} /></FormItem>} />
                        <FormField name="missionImageUrl" render={({ field }) => <FormItem><FormLabel>URL da Imagem da Missão</FormLabel><Input {...field} /></FormItem>} />
                        <FormField name="historyTitle" render={({ field }) => <FormItem><FormLabel>Título da História</FormLabel><Input {...field} /></FormItem>} />
                        <FormField name="historyDescription" render={({ field }) => <FormItem><FormLabel>Descrição da História</FormLabel><Textarea {...field} /></FormItem>} />
                        <FormField name="historyImageUrl" render={({ field }) => <FormItem><FormLabel>URL da Imagem da História</FormLabel><Input {...field} /></FormItem>} />
                    </CardContent>
                </Card>
                 <Button type="submit">Salvar Página Sobre</Button>
            </form>
          </FormProvider>
        </TabsContent>
        <TabsContent value="our-space">
             <FormProvider {...ourSpaceForm}>
                 <form onSubmit={ourSpaceForm.handleSubmit(data => onSubmit(data, 'ourSpaceContent'))} className="space-y-6">
                    <Card>
                        <CardHeader>
                        <CardTitle>Página Nosso Espaço</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <FormField name="headerTitle" render={({ field }) => <FormItem><FormLabel>Título do Cabeçalho</FormLabel><Input {...field} /></FormItem>} />
                             <FormField name="headerDescription" render={({ field }) => <FormItem><FormLabel>Descrição do Cabeçalho</FormLabel><Textarea {...field} /></FormItem>} />
                            <h3 className="font-semibold mt-4">Itens da Galeria</h3>
                             <FieldArrayComponent name="gallery" form={ourSpaceForm} fieldsConfig={{
                                id: 'ID (ex: space-reception)',
                                title: 'Título da Imagem',
                                imageUrl: 'URL da Imagem',
                            }} />
                        </CardContent>
                    </Card>
                    <Button type="submit">Salvar Página Nosso Espaço</Button>
                 </form>
             </FormProvider>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Generic component to render array of fields
const FieldArrayComponent = ({ name, form, fieldsConfig, textAreaFields = [] }: { name: string, form: any, fieldsConfig: Record<string, string>, textAreaFields?: string[] }) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name
  });

  return (
    <div className="space-y-4">
      {fields.map((item, index) => (
        <Card key={item.id} className="p-4 relative">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={() => remove(index)}
          >
            Remover
          </Button>
          <div className="space-y-2">
            {Object.keys(fieldsConfig).map(fieldName => (
               <FormField
                key={fieldName}
                control={form.control}
                name={`${name}.${index}.${fieldName}`}
                render={({ field }) => {
                    const value = field.value;
                    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                        let newValue: string | string[] | boolean = e.target.value;
                        if (typeof value === 'boolean') {
                            newValue = newValue.toLowerCase() === 'true';
                        }
                        if (Array.isArray(value)) {
                            newValue = newValue.split(',').map(s => s.trim());
                        }
                        field.onChange(newValue);
                    };

                    const inputValue = Array.isArray(value) ? value.join(', ') : String(value);

                    return (
                        <FormItem>
                            <FormLabel>{fieldsConfig[fieldName]}</FormLabel>
                            {textAreaFields.includes(fieldName) ? (
                                <Textarea
                                {...field}
                                value={Array.isArray(field.value) ? field.value.join('\\n') : field.value}
                                onChange={(e) => field.onChange(e.target.value.split('\\n'))}
                                />
                            ) : (
                                <Input
                                {...field}
                                value={inputValue}
                                onChange={onChange}
                                />
                            )}
                            <FormMessage />
                        </FormItem>
                    );
                }}
              />
            ))}
          </div>
        </Card>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={() => {
            const newObject = Object.keys(fieldsConfig).reduce((acc, key) => {
                // @ts-ignore
                const defaultValue = form.defaultValues?.[name]?.[0]?.[key];
                if (typeof defaultValue === 'boolean') {
                    // @ts-ignore
                    acc[key] = false;
                } else if (Array.isArray(defaultValue)) {
                     // @ts-ignore
                    acc[key] = [];
                }
                else {
                     // @ts-ignore
                    acc[key] = '';
                }
                return acc;
            }, {});
            append(newObject);
        }}
      >
        Adicionar Item
      </Button>
    </div>
  );
};


export default AdminPage;
