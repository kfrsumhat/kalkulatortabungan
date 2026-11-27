/** Pecah teks per kata. React yang merender span-nya (aman dari konflik DOM). */
export const splitWords = (t: string) => t.split(/\s+/).filter(Boolean);
