export const PLAYER_TOKEN_TEXTURE_KEY = "player-token";
export const DOG_TOKEN_TEXTURE_KEY = "dog-token";
export const CHARACTER_TOKEN_SIZE = 24;
export const CHARACTER_BODY_SIZE = 18;

export type CharacterTokenAssetLoader = {
  svg: (key: string, url: string, svgConfig: { width: number; height: number }) => void;
};

export function preloadCharacterTokenAssets(loader: CharacterTokenAssetLoader): void {
  loader.svg(PLAYER_TOKEN_TEXTURE_KEY, "images/player-token.svg", {
    height: CHARACTER_TOKEN_SIZE,
    width: CHARACTER_TOKEN_SIZE,
  });
  loader.svg(DOG_TOKEN_TEXTURE_KEY, "images/dog-token.svg", {
    height: CHARACTER_TOKEN_SIZE,
    width: CHARACTER_TOKEN_SIZE,
  });
}
