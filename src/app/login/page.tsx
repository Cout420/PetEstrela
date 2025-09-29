
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

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

    if (data.username !== validUsername || data.password !== validPassword) {
      toast({
        title: 'Erro de Autenticação',
        description: 'Usuário ou senha inválidos.',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }
    
    try {
        // Since we are not using a real auth provider for this simple case,
        // we can consider the login successful if credentials match.
        // We'll use router to redirect.
        
        toast({
          title: 'Login bem-sucedido!',
          description: 'Redirecionando para o painel...',
        });
        
        router.push('/admin');

    } catch (error) {
        console.error("Login failed:", error);
        toast({
            title: 'Falha no Login',
            description: 'Ocorreu um erro inesperado durante o login. Tente novamente.',
            variant: 'destructive',
        });
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
