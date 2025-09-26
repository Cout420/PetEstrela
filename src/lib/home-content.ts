import { PlaceHolderImages } from './placeholder-images';
import { Clock, CreditCard, Heart } from 'lucide-react';

export const heroSlides = [
  {
    imageUrl: PlaceHolderImages.find((img) => img.id === 'hero-building')?.imageUrl ?? '',
    title: 'Pet Estrela Crematório',
    subtitle: 'Instalações modernas e seguras para cuidar do seu companheiro.',
  },
  {
    imageUrl: PlaceHolderImages.find((img) => img.id === 'hero-all-pets')?.imageUrl ?? '',
    title: 'Cuidado para Todos os Amigos',
    subtitle: 'Atendemos cães, gatos, aves, cavalos e animais exóticos de todos os portes.',
  },
  {
    imageUrl: PlaceHolderImages.find((img) => img.id === 'hero-garden')?.imageUrl ?? '',
    title: 'Despedida com Dignidade e Respeito',
    subtitle: 'Honramos a memória do seu pet com todo carinho que ele merece.',
  },
];

export const whyChooseUs = {
    title: 'Por Que Escolher o Pet Estrela?',
    description: 'Oferecemos um serviço completo, com a sensibilidade e o respeito que este momento delicado exige.',
    items: [
        {
            icon: 'Clock',
            title: 'Agilidade',
            description: 'Processo rápido e respeitoso para sua maior tranquilidade.',
        },
        {
            icon: 'Clock',
            title: 'Atendimento 24h',
            description: 'Nossa equipe está disponível a qualquer hora do dia.',
        },
        {
            icon: 'CreditCard',
            title: 'Preço Acessível',
            description: 'Planos que se ajustam às suas necessidades e orçamento.',
        },
        {
            icon: 'Heart',
            title: 'Cuidado Especial',
            description: 'Tratamos todos os pets, incluindo exóticos, com amor.',
        },
    ]
}


export const cremationProcess = {
    title: 'Nosso Processo de Cremação',
    description: 'Conduzimos cada etapa com máxima transparência, cuidado e seriedade.',
    steps: [
        {
            step: '01',
            title: 'Coleta do Animal',
            description: 'Realizamos a remoção do seu pet em sua residência ou clínica veterinária com veículos adaptados.',
        },
        {
            step: '02',
            title: 'Preparação',
            description: 'O corpo do seu amigo é preparado com todo o respeito e cuidado para a cerimônia de despedida.',
        },
        {
            step: '03',
            title: 'Cremação',
            description: 'O processo de cremação é realizado de forma individual ou coletiva, seguindo sua escolha.',
        },
        {
            step: '04',
            title: 'Entrega das Cinzas',
            description: 'As cinzas são entregues em uma urna de sua preferência, junto com um certificado.',
        },
    ]
}

export const allPetsSection = {
    title: 'Acolhemos Todos os Tipos de Pets',
    description: 'Nosso amor e respeito se estendem a todos os animais, não importa a espécie ou o porte. Estamos preparados para oferecer uma despedida digna a cada um deles.',
    imageUrl: PlaceHolderImages.find((img) => img.id === 'section-all-pets')?.imageUrl ?? '',
    petsList: ['Cães', 'Gatos', 'Aves', 'Roedores', 'Répteis', 'Cavalos']
}


export const homePageContent = {
    heroSlides,
    whyChooseUs,
    cremationProcess,
    allPetsSection
}
