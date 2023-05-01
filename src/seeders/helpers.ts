import { faker } from '@mikro-orm/seeder';
import type { Image } from '../entities';

/**
 * loremflickr image types
 */
type ImageTypes = 'dog' | 'cat' | 'food' | 'avatar' | 'shop' | 'car' | 'department' | 'mcdonalds' | 'factory';
export const generateImage = (type: ImageTypes): Omit<Image, 'id'> => ({
	alt: faker.git.commitMessage(),
	name: faker.name.jobTitle(),
	url: faker.image.imageUrl(640, 480, type, true)
});
