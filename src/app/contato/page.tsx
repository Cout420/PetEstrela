
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Por favor, insira um e-mail válido.",
  }),
  subject: z.string().min(5, {
    message: "O assunto deve ter pelo menos 5 caracteres.",
  }),
  message: z.string().min(10, {
    message: "A mensagem deve ter pelo menos 10 caracteres.",
  }),
});

const contactInfo = [
  {
    icon: <Phone className="w-6 h-6 text-primary" />,
    title: "Telefone e WhatsApp",
    value: "(11) 4240-5253",
    href: "https://wa.me/551142405253?text=Olá!%20Tudo%20bem?%20Gostaria%20de%20ser%20atendido%20e%20saber%20mais",
  },
  {
    icon: <Mail className="w-6 h-6 text-primary" />,
    title: "Email",
    value: "crematorioestrela@gmail.com",
    href: "mailto:crematorioestrela@gmail.com",
  },
  {
    icon: <MapPin className="w-6 h-6 text-primary" />,
    title: "Endereço",
    value: "Av. Adília Barbosa Neves, 2740 - Centro Industrial, Arujá - SP, 07432-575",
  },
  {
    icon: <Clock className="w-6 h-6 text-primary" />,
    title: "Atendimento 24h",
    value: "Disponível todos os dias da semana",
  },
];

export default function ContatoPage() {

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const { name, email, subject, message } = values;
    const whatsAppMessage = `
*Contato via Site*

*Nome:* ${name}
*Email:* ${email}
*Assunto:* ${subject}

*Mensagem:*
${message}
    `;
    const encodedMessage = encodeURIComponent(whatsAppMessage.trim());
    const whatsappUrl = `https://wa.me/551142405253?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    form.reset();
  }

  return (
    <div className="bg-background">
      <section className="py-16 text-center bg-white">
        <div className="container mx-auto max-w-7xl px-4">
          <h1 className="font-headline text-5xl md:text-7xl font-bold text-primary">Entre em Contato</h1>
          <p className="mt-4 text-lg text-foreground/80 max-w-2xl mx-auto">
            Estamos aqui para ajudar. Envie sua dúvida, sugestão ou solicitação de atendimento.
          </p>
        </div>
      </section>
      
      <section className="container mx-auto max-w-7xl px-4 py-20">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <h2 className="font-headline text-3xl text-primary">Nossos Canais</h2>
            <div className="space-y-6">
              {contactInfo.map((item, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="bg-secondary p-3 rounded-full">{item.icon}</div>
                  <div>
                    <h3 className="font-bold text-lg">{item.title}</h3>
                    {item.href ? (
                       <a href={item.href} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">{item.value}</a>
                    ) : (
                      <p className="text-muted-foreground">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
             <p className="text-muted-foreground italic">
                Para emergências, recomendamos o contato telefônico para uma resposta mais rápida. Nosso time está de prontidão 24 horas por dia para oferecer o suporte necessário.
             </p>
          </div>

          {/* Contact Form */}
          <div>
             <Card className="p-8 shadow-lg">
                <CardContent className="p-0">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome</FormLabel>
                            <FormControl>
                              <Input placeholder="Seu nome completo" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="seu.email@exemplo.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Assunto</FormLabel>
                            <FormControl>
                              <Input placeholder="Sobre o que você gostaria de falar?" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mensagem</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Digite sua mensagem aqui..."
                                className="min-h-[120px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                       <Button type="submit" size="lg" className="w-full">
                          Enviar Mensagem
                      </Button>
                    </form>
                  </Form>
                </CardContent>
             </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
