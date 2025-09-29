
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { app } from '@/lib/firebase-config';
import { getApps } from 'firebase/app';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { PawIcon } from '@/components/icons';
import { Loader2 } from 'lucide-react';

const loginSchema = z.object({
  username: z.string().min(1, { message: 'Usuário é obrigatório.' }),
  password: z.string().min(1, { message: 'Senha é obrigatória.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const auth = getApps().length ? getAuth(app) : null;


  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });
  
  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);

    const validUsername = process.env.NEXT_PUBLIC_ADMIN_USERNAME;
    const validPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

    // Use a dummy email for Firebase Auth, as it requires an email format.
    // The actual username is checked against env variables.
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

    if (data.username !== validUsername || data.password !== validPassword) {
      toast({
        title: 'Erro de Autenticação',
        description: 'Usuário ou senha inválidos.',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }
    
    if (!auth || !adminEmail) {
        toast({
            title: 'Erro de Configuração',
            description: 'A autenticação não está configurada corretamente.',
            variant: 'destructive',
        });
        setIsLoading(false);
        return;
    }

    try {
      await signInWithEmailAndPassword(auth, adminEmail, data.password);
      toast({
        title: 'Login bem-sucedido!',
        description: 'Redirecionando para o painel...',
      });
      router.push('/admin');
    } catch (error: any) {
        // This is likely to fail if the user doesn't exist, which is fine.
        // We are just using it to create a session.
        // For a real app, you would create this user in the Firebase console.
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
             toast({
                title: 'Erro de Autenticação',
                description: 'As credenciais de administrador não estão configuradas no Firebase. Crie um usuário com o e-mail e senha definidos nas variáveis de ambiente.',
                variant: 'destructive',
             });
        } else {
            toast({
                title: 'Erro de Login',
                description: 'Ocorreu um erro inesperado. Verifique o console.',
                variant: 'destructive',
            });
        }
      console.error("Login Error:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
               <PawIcon className="h-10 w-10 text-primary" />
            </div>
          <CardTitle>Painel Administrativo</CardTitle>
          <CardDescription>Acesse para gerenciar o conteúdo do site.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usuário</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu usuário" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Sua senha" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                 {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                 Entrar
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
