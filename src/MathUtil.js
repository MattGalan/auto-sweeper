import lerp from 'lerp';

export function hundredLerp(start, finish, animeProgress) {
    return(lerp(start, finish, animeProgress / 100));
}