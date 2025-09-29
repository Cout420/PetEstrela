
import { PlaceHolderImages } from './placeholder-images';

export const aboutPageContent = {
    headerTitle: "Sobre o Pet Estrela",
    headerDescription: "Há mais de 10 anos, nossa missão é proporcionar uma despedida digna e respeitosa, transformando a dor da perda em uma celebração do amor e da amizade.",
    missionTitle: "Nossa Missão",
    missionDescription: "Nossa missão é oferecer um serviço de cremação pet que transcenda o procedimento técnico. Buscamos acolher as famílias em um dos momentos mais delicados, garantindo que a memória de seus companheiros seja honrada com a máxima dignidade. Acreditamos que cada vida, não importa o quão pequena, merece uma despedida grandiosa.",
    missionImageUrl: PlaceHolderImages.find((img) => img.id === 'about-mission')?.imageUrl ?? '',
    historyTitle: "Nossa História",
    historyDescription: "Fundada em 2014 com o sonho de oferecer um serviço funerário pet diferenciado, a Pet Estrela nasceu da paixão e do respeito pelos animais. Ao longo dos anos, crescemos e nos modernizamos, mas nunca perdemos a essência do nosso trabalho: o acolhimento.",
    historyImageUrl: PlaceHolderImages.find((img) => img.id === 'about-history')?.imageUrl ?? '',
};

    