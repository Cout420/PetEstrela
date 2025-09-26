import type { BarChart, LineChart } from 'lucide-react';
import { PlaceHolderImages } from './placeholder-images';

export const testimonials = [
  { id: 1, name: 'Ana Souza', text: 'O atendimento foi incrível, cheio de empatia e respeito. Fizeram deste momento difícil algo mais sereno. Recomendo de olhos fechados.' },
  { id: 2, name: 'Marcos Lima', text: 'Serviço impecável do início ao fim. A entrega da urna foi um momento muito emocionante e bem conduzido. Obrigado por tudo.' },
  { id: 3, name: 'Juliana Costa', text: 'Só tenho a agradecer pelo carinho com meu pequeno. A agilidade e a atenção aos detalhes fizeram toda a diferença para mim e minha família.' },
  { id: 4, name: 'Ricardo Pereira', text: 'Profissionalismo exemplar. Cuidaram do nosso companheiro de anos com a dignidade que ele merecia. O memorial online é uma linda homenagem.' },
  { id: 5, name: 'Fernanda Martins', text: 'Fiquei muito satisfeita com o plano Harmonia. O porta-retrato e o plantio da árvore foram gestos que aqueceram nosso coração.' },
  { id: 6, name: 'Lucas Gonçalves', text: 'Processo transparente e muito humano. A equipe está de parabéns pela sensibilidade e pelo excelente trabalho prestado.' },
  { id: 7, name: 'Patrícia Almeida', text: 'Em um momento de tanta dor, encontrar um serviço tão acolhedor foi um alento. Cuidaram de tudo com perfeição. Gratidão eterna.' },
  { id: 8, name: 'Bruno Ferreira', text: 'A estrutura é de primeiro mundo e a equipe é extremamente qualificada. Passam muita segurança e tranquilidade.' },
  { id: 9, name: 'Camila Ribeiro', text: 'O plano Eternus foi a escolha certa para nós. A preparação para o velório foi linda e nos ajudou a processar o luto.' },
  { id: 10, name: 'Gustavo Santos', text: 'O melhor serviço da região. Atendimento 24h foi essencial, pois tudo aconteceu de madrugada. Foram muito ágeis e prestativos.' },
  { id: 11, name: 'Larissa Oliveira', text: 'A cartinha personalizada foi um toque de delicadeza que jamais esqueceremos. Detalhes que mostram o quanto eles se importam.' },
  { id: 12, name: 'Felipe Azevedo', text: 'Nunca imaginei que a despedida do meu cavalo pudesse ser tão respeitosa. A equipe está preparada para animais de todos os portes.' },
];

export const memorialPets = [
  {
    id: 1,
    name: 'Bento',
    species: 'Golden Retriever',
    age: '8 anos',
    family: 'Família Silva',
    birthDate: '10/03/2016',
    passingDate: '22/05/2024',
    text: 'Nosso eterno companheiro de quatro patas. Bento trouxe luz e alegria para nossas vidas. Suas corridas no parque e seu olhar carinhoso jamais serão esquecidos. Você foi o melhor amigo que poderíamos ter. Te amaremos para sempre.',
    image: PlaceHolderImages.find((img) => img.id === 'pet-bento'),
  },
  {
    id: 2,
    name: 'Luna',
    species: 'Gata Siamesa',
    age: '12 anos',
    family: 'Família Santos',
    birthDate: '15/08/2012',
    passingDate: '18/06/2024',
    text: 'Nossa rainha Luna, dona de uma elegância e personalidade únicas. Cada miado, cada ronronar e cada momento de preguiça no sol estão guardados em nossos corações. Sentiremos saudades da sua presença marcante.',
    image: PlaceHolderImages.find((img) => img.id === 'pet-luna'),
  },
  {
    id: 3,
    name: 'Max',
    species: 'Labrador',
    age: '10 anos',
    family: 'Família Costa',
    birthDate: '20/01/2014',
    passingDate: '01/04/2024',
    text: 'Max, nosso protetor fiel e amigo para todas as horas. Sua lealdade era infinita e sua alegria contagiante. As bolinhas perderam a graça sem você. Obrigado por uma década de amor incondicional.',
    image: PlaceHolderImages.find((img) => img.id === 'pet-max'),
  },
  {
    id: 4,
    name: 'Mimi',
    species: 'Gata Persa',
    age: '15 anos',
    family: 'Família Oliveira',
    birthDate: '05/11/2008',
    passingDate: '30/03/2024',
    text: 'Nossa doce e peluda Mimi. Quinze anos de puro amor e companheirismo. Seu jeitinho calmo e seu olhar meigo nos trouxeram paz. Você foi uma parte essencial da nossa família e sua ausência é sentida a cada dia.',
    image: PlaceHolderImages.find((img) => img.id === 'pet-mimi'),
  },
];

export const teamMembers = [
    {
        name: 'Dr. Carlos Silva',
        role: 'Diretor Geral',
        image: PlaceHolderImages.find((img) => img.id === 'team-carlos'),
    },
    {
        name: 'Maria Santos',
        role: 'Coordenadora de Atendimento',
        image: PlaceHolderImages.find((img) => img.id === 'team-maria'),
    },
    {
        name: 'João Oliveira',
        role: 'Técnico Especializado',
        image: PlaceHolderImages.find((img) => img.id === 'team-joao'),
    },
]

export const adminStats = {
  totalMemorials: 5280,
  servicesThisMonth: 45,
  pendingServices: 3,
  monthlyRevenue: 54000,
};

export const revenueData = [
  { month: 'Jan', revenue: 48000 },
  { month: 'Fev', revenue: 42000 },
  { month: 'Mar', revenue: 51000 },
  { month: 'Abr', revenue: 55000 },
  { month: 'Mai', revenue: 49000 },
  { month: 'Jun', revenue: 54000 },
];

export const servicesData = [
  { name: 'Essência', value: 18 },
  { name: 'Harmonia', value: 22 },
  { name: 'Eternus', value: 5 },
];
