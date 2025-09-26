import { PlaceHolderImages } from './placeholder-images';

export const ourSpaceContent = {
  headerTitle: "Nosso Espaço",
  headerDescription: "Um ambiente pensado para oferecer paz, conforto e respeito. Conheça as instalações do Pet Estrela, preparadas para proporcionar uma despedida digna e serena ao seu companheiro.",
  gallery: [
    {
      id: 'space-reception',
      title: 'Recepção Acolhedora',
      imageUrl: PlaceHolderImages.find((img) => img.id === 'space-reception')?.imageUrl ?? '',
    },
    {
      id: 'space-chapel',
      title: 'Sala de Despedida',
      imageUrl: PlaceHolderImages.find((img) => img.id === 'space-chapel')?.imageUrl ?? '',
    },
    {
      id: 'space-crematory',
      title: 'Equipamento Moderno',
      imageUrl: PlaceHolderImages.find((img) => img.id === 'space-crematory')?.imageUrl ?? '',
    },
    {
      id: 'space-garden',
      title: 'Jardim Memorial',
      imageUrl: PlaceHolderImages.find((img) => img.id === 'space-garden')?.imageUrl ?? '',
    },
    {
      id: 'space-urns',
      title: 'Opções de Urnas',
      imageUrl: PlaceHolderImages.find((img) => img.id === 'space-urns')?.imageUrl ?? '',
    },
    {
      id: 'space-facade',
      title: 'Fachada Pet Estrela',
      imageUrl: PlaceHolderImages.find((img) => img.id === 'space-facade')?.imageUrl ?? '',
    },
  ]
};

    