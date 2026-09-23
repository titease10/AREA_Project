-- AlterTable
ALTER TABLE "SpotifyService" ADD COLUMN     "episodeShows" JSONB[],
ADD COLUMN     "savedEpisodes" JSONB[],
ADD COLUMN     "savedShows" JSONB[],
ADD COLUMN     "savedTracks" JSONB[],
ADD COLUMN     "topArtists" JSONB[],
ADD COLUMN     "topTracks" JSONB[];
