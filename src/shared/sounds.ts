import { Sound } from "w3ts";

type CustomSounds = "Sound/Dialogue/HumanCampaign/Human04/H04Arthas11.flac";

export function playCustomSound(randomSound: CustomSounds) {
    Sound.create(randomSound, false, false, false, 0, 0, "")?.start();
}
