import { Album } from "./data";

// Base URL for ImgBB direct image serving.
// When you upload your images to ImgBB and get the direct folder/hash, replace this constant value with your actual ImgBB base URL (e.g., https://i.ibb.co/your_hash).
export const IMGBB_BASE_URL = "https://i.ibb.co";

/**
 * Normalizes artist name and album title into a secure, standard URL filename syntax [artist]_[title].png.
 * Conversions: lowercases, strips Vietnamese accents/diacritics, removes non-alphanumeric special characters, replaces spaces/dashes with a single underscore.
 */
export function getImgbbCoverUrl(artist: string, title: string): string {
  const clean = (val: string) => {
    return (val || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove Vietnamese accents
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .replace(/[^a-z0-9\s-_]/g, "") // keep only alphanumeric and basic separations
      .trim()
      .replace(/[\s-]+/g, "_"); // join with a single underscore symbol
  };
  
  const key = `${clean(artist)}_${clean(title)}`;
  
  const DIRECT_URLS: Record<string, string> = {
    "bjork_vespertine": "https://i.ibb.co/gMnF9rP4/bjork-vespertine.png",
    "kylie_minogue_impossible_princess": "https://i.ibb.co/7JSWMgCQ/kylie-minogue-impossible-princess-deluxe-edition.webp",
    "kylie_minogue_impossible_princess_deluxe_edition": "https://i.ibb.co/7JSWMgCQ/kylie-minogue-impossible-princess-deluxe-edition.webp",
    "madonna_confessions_on_a_dance_floor": "https://i.ibb.co/HLX2x5y1/madonna-confessions-on-a-dance-floor-twenty-years-edition.png",
    "madonna_confessions_on_a_dance_floor_twenty_years_edition": "https://i.ibb.co/HLX2x5y1/madonna-confessions-on-a-dance-floor-twenty-years-edition.png",
    "charli_xcx_brat": "https://i.ibb.co/C325GfvS/charli-xcx-brat.webp",
    "lana_del_rey_did_you_know_that_theres_a_tunnel_under_ocean_blvd": "https://i.ibb.co/67D4nQZ6/lana-del-rey-did-you-know-that-theres-a-tunnel-under-ocean-blvd.webp",
    "madonna_ray_of_light": "https://i.ibb.co/QvLMqbxZ/madonna-ray-of-light.png",
    "lorde_pure_heroine": "https://i.ibb.co/zWQC8b7F/lorde-pure-heroine.webp",
    "tlinh_ai": "https://i.ibb.co/4gTmj2by/tlinh-ai.png",
    "lana_del_rey_norman_fucking_rockwell": "https://i.ibb.co/qLLk4Qw8/lana-del-rey-norman-fucking-rockwell.webp",
    "phung_khanh_linh_giua_mot_van_nguoi": "https://i.ibb.co/Dgj6jvVG/phung-khanh-linh-giua-mot-van-nguoi.png",
    "madonna_erotica_pa_version": "https://i.ibb.co/JRLLX12L/madonna-erotica-pa-version.png",
    "kesha_gag_order": "https://i.ibb.co/zhHkF3Dt/kesha-gag-order.webp",
    "fka_twigs_eusexua": "https://i.ibb.co/bj4MBgC0/fka-twigs-eusexua.png",
    "fka_twigs_eusexua_afterglow": "https://i.ibb.co/HLgNkRk0/fka-twigs-eusexua-afterglow.png",
    "kylie_minogue_fever": "https://i.ibb.co/gLgwPjcf/kylie-minogue-fever.png",
    "kylie_minogue_light_years": "https://i.ibb.co/15gxDRp/kylie-minogue-light-years.png",
    "zara_larsson_midnight_sun_girls_trip": "https://i.ibb.co/Fk3rSPr0/zara-larsson-midnight-sun-girls-trip.png",
    "zara_larsson_midnight_sun": "https://i.ibb.co/Fk3rSPr0/zara-larsson-midnight-sun-girls-trip.png",
    "miley_cyrus_something_beautiful": "https://i.ibb.co/B5prKHjB/miley-cyrus-something-beautiful.png",
    "lorde_virgin": "https://i.ibb.co/sdmXtQfL/lorde-virgin.png",
    "obito_danh_doi": "https://i.ibb.co/x9rfH1v/obito-danh-doi.png",
    "wren_evans_loi_choi_the_neo_pop_punk": "https://i.ibb.co/B5DPQpM4/wren-evans-loi-choi-the-neo-pop-punk.png",
    "addison_rae_addison": "https://i.ibb.co/bjFFk2yM/addison-rae-addison.jpg",
    "bjork_vulnicura": "https://i.ibb.co/nM63hJC4/bjork-vulnicura.png",
    "pinkpantheress_fancy_that": "https://i.ibb.co/60sYzJ1B/pinkpantheress-fancy-that.png",
    "wren_evans_no": "https://i.ibb.co/ynPzd3Wx/wren-evans-no.png",
    "bjork_biophilia": "https://i.ibb.co/YTyT0nh8/bjork-biophilia-deluxe-edition.png",
    "bjork_biophilia_deluxe_edition": "https://i.ibb.co/YTyT0nh8/bjork-biophilia-deluxe-edition.png",
    "bjork_volta": "https://i.ibb.co/k6HM7f8b/bjork-volta.png",
    "c418_minecraft_volume_alpha": "https://i.ibb.co/qFCXr1Tq/c418-minecraft-volume-alpha.png",
    "c418_minecraft_volume_beta": "https://i.ibb.co/yc0n3NYK/c418-minecraft-volume-beta.jpg",
    "tlinh_flvr": "https://i.ibb.co/ZRBS614R/tlinh-flvr.png",
    "bich_phuong_tam_trang_tan_hoi_cham_mot_chut": "https://i.ibb.co/5Xq3LNCb/bich-phuong-tam-trang-tan-hoi-cham-mot-chut.png",
    "cupcakke_dauntless_manifesto": "https://i.ibb.co/QvmBqFks/cupcakke-dauntless-manifesto.png",
    "kylie_minogue_body_language": "https://i.ibb.co/mrFD3v2C/kylie-minogue-body-language.png",
    "kylie_minogue_kylie_minogue_1994": "https://i.ibb.co/k6hNhsRt/kylie-minogue-kylie-minogue-special-edition.jpg",
    "kylie_minogue_kylie_minogue_special_edition": "https://i.ibb.co/k6hNhsRt/kylie-minogue-kylie-minogue-special-edition.jpg",
    "billie_eilish_hit_me_hard_and_soft": "https://i.ibb.co/tpHyPtGz/billie-eilish-hit-me-hard-and-soft.png",
    "beyonce_renaissance": "https://i.ibb.co/BHTRcXrW/beyonce-renaissance.png",
    "madonna_madame_x_international_deluxe": "https://i.ibb.co/tp5TDN99/madonna-madame-x-deluxe.png",
    "madonna_madame_x_deluxe": "https://i.ibb.co/tp5TDN99/madonna-madame-x-deluxe.png",
    "madonna_madame_x": "https://i.ibb.co/tp5TDN99/madonna-madame-x-deluxe.png",
    "madonna_american_life": "https://i.ibb.co/RpyvH3Lp/madonna-american-life.png",
    "phuong_my_chi_vu_tru_co_bay_school_tour_2024_version": "https://i.ibb.co/BHvpbfGT/phuong-my-chi-vu-tru-co-bay-school-tour-2024-version.png",
    "phuong_my_chi_vu_tru_co_bay": "https://i.ibb.co/BHvpbfGT/phuong-my-chi-vu-tru-co-bay-school-tour-2024-version.png",
    "rose_gray_louder_please": "https://i.ibb.co/QFXJyG7k/rose-gray-louder-please.png",
    "lana_del_rey_born_to_die_the_paradise_edition": "https://i.ibb.co/PGJvDBt9/lana-del-rey-born-to-die-paradise-edition-special-version.jpg",
    "lana_del_rey_born_to_die_paradise_edition_special_version": "https://i.ibb.co/PGJvDBt9/lana-del-rey-born-to-die-paradise-edition-special-version.jpg",
    "jessie_ware_whats_your_pleasure": "https://i.ibb.co/JwSyMtgS/jessie-ware-whats-your-pleasure.webp",
    "madonna_bedtime_stories": "https://i.ibb.co/8gTbJhRY/madonna-bedtime-stories.png",
    "madonna_music": "https://i.ibb.co/ZRTDJFnZ/madonna-music.png",
    "the_thien_tran_the": "https://i.ibb.co/4R0yFnH3/the-thien-tran-the.png",
    "lana_del_rey_blue_banisters": "https://i.ibb.co/qLrc0DmF/lana-del-rey-blue-banisters.webp",
    "madonna_like_a_prayer": "https://i.ibb.co/pB2KF0rN/madonna-like-a-prayer.png",
    "tate_mcrae_so_close_to_what": "https://i.ibb.co/ym74cCbn/tate-mcrae-so-close-to-what.png",
    "lady_gaga_the_fame_monster_deluxe_edition": "https://i.ibb.co/4Rvd0xmM/lady-gaga-the-fame-monster-deluxe-edition.png",
    "lady_gaga_the_fame_monster": "https://i.ibb.co/4Rvd0xmM/lady-gaga-the-fame-monster-deluxe-edition.png",
    "taylor_swift_evermore_deluxe_version": "https://i.ibb.co/CpFJ6zZf/taylor-swift-evermore-deluxe-version.png",
    "taylor_swift_evermore": "https://i.ibb.co/CpFJ6zZf/taylor-swift-evermore-deluxe-version.png",
    "bjork_homogenic": "https://i.ibb.co/F4MdNNNR/bjork-homogenic.webp",
    "imogen_heap_speak_for_yourself": "https://i.ibb.co/0jHSHXj9/imogen-heap-speak-for-yourself.png",
    "ms_lauryn_hill_the_miseducation_of_lauryn_hill": "https://i.ibb.co/nMN0X2Ck/ms-lauryn-hill-the-miseducation-of-lauryn-hill.png",
    "billie_eilish_happier_than_ever": "https://i.ibb.co/VyZM7FC/billie-eilish-happier-than-ever.png",
    "nelly_furtado_loose": "https://i.ibb.co/svz8TL5f/nelly-furtado-loose.png",
    "taylor_swift_1989_taylors_version": "https://i.ibb.co/7NS63yfh/taylor-swift-1989-taylors-version.png",
    "billie_eilish_dont_smile_at_me": "https://i.ibb.co/XZhcF1Xz/billie-eilish-dont-smile-at-me.png",
    "lady_gaga_mayhem": "https://i.ibb.co/ycpRbbXn/lady-gaga-mayhem.png",
    "lorde_melodrama": "https://i.ibb.co/yn0LxRkZ/lorde-melodrama.png",
    "chappell_roan_the_rise_and_fall_of_a_midwest_princess": "https://i.ibb.co/LXPCWz3G/chappell-roan-the-rise-and-fall-of-a-midwest-princess.png",
    "caroline_polachek_desire_i_want_to_turn_into_you_everasking_edition": "https://i.ibb.co/nNv4h9R8/caroline-polachek-desire-i-want-to-turn-into-you-everasking-edition.png",
    "caroline_polachek_desire_i_want_to_turn_into_you": "https://i.ibb.co/nNv4h9R8/caroline-polachek-desire-i-want-to-turn-into-you-everasking-edition.png",
    "st_vincent_masseduction": "https://i.ibb.co/tp01422K/st-vincent-masseduction.png",
    "olivia_rodrigo_guts_spilled": "https://i.ibb.co/4vCwSf2/olivia-rodrigo-guts-spilled.png",
    "olivia_rodrigo_sour": "https://i.ibb.co/gMYJ8LLZ/olivia-rodrigo-sour.png",
    "orange_camon": "https://i.ibb.co/V0RhmbQt/orange-camon.png",
    "towa_tei_sound_museum": "https://i.ibb.co/vvTmSjm4/towa-tei-sound-museum.png",
    "cupcakke_cum_cake": "https://i.ibb.co/VWkPYQSg/cupcakke-cum-cake.png",
    "cupcakke_std": "https://i.ibb.co/DH4Npgfy/cupcakke-std.jpg",
    "cupcakke_the_bakkery": "https://i.ibb.co/xK7vX0nk/cupcakke-the-bakkery.png",
    "cardi_b_am_i_the_drama": "https://i.ibb.co/S4z6WKfS/cardi-b-am-i-the-drama.png",
    "low_g_l2k": "https://i.ibb.co/1YjsDFhn/low-g-l2k.png",
    "2pillz_pillzcasso": "https://i.ibb.co/7N6P9YZf/2pillz-pillzcasso.png",
    "esthero_breath_from_another": "https://i.ibb.co/v6nBj9dJ/esthero-breath-from-another.png",
    "taylor_swift_reputation": "https://i.ibb.co/Nd7kJddb/taylor-swift-reputation.png",
    "tyler_the_creator_igor": "https://i.ibb.co/Ps5K3ppC/tyler-the-creator-igor.jpg",
    "the_weeknd_starboy_deluxe": "https://i.ibb.co/vvfZ9J6C/the-weeknd-starboy-deluxe.png",
    "the_weeknd_starboy": "https://i.ibb.co/vvfZ9J6C/the-weeknd-starboy-deluxe.png",
    "charli_xcx_crash_deluxe": "https://i.ibb.co/4RBBJRMQ/charli-xcx-crash-deluxe.jpg",
    "fka_twigs_magdalene": "https://i.ibb.co/HDm6wY9s/fka-twigs-magdalene.png",
    "hoang_thuy_linh_link": "https://i.ibb.co/QvqRhG2z/hoang-thuy-linh-link.png",
    "madonna_rebel_heart_deluxe": "https://i.ibb.co/F21Bwrp/madonna-rebel-heart-deluxe.png",
    "madonna_rebel_heart": "https://i.ibb.co/F21Bwrp/madonna-rebel-heart-deluxe.png",
    "camila_cabello_cxoxo": "https://i.ibb.co/tpV0DB1X/camila-cabello-cxoxo.png",
    "jade_thats_showbiz_baby": "https://i.ibb.co/fYZrQ2q9/jade-thats-showbiz-baby.png",
    "adela_the_provocateur": "https://i.ibb.co/67CHkmw4/adela-the-provocateur.png",
    "rosalia_lux_complete_works": "https://i.ibb.co/GvG32QDs/rosalia-lux-complete-works.png",
    "rosalia_lux": "https://i.ibb.co/GvG32QDs/rosalia-lux-complete-works.png",
    "lily_allen_west_end_girl": "https://i.ibb.co/fYKCLW01/lily-allen-west-end-girl.png",
    "kylie_minogue_tension_ii": "https://i.ibb.co/m5rqznM3/kylie-minogue-tension-ii.png",
    "kylie_minogue_tension": "https://i.ibb.co/m5rqznM3/kylie-minogue-tension-ii.png",
    "kylie_minogue_aphrodite": "https://i.ibb.co/60s6HYC9/kylie-minogue-aphrodite.png",
    "ariana_grande_dangerous_woman": "https://i.ibb.co/whY9tQgj/ariana-grande-dangerous-woman.jpg",
    "ariana_grande_eternal_sunshine_deluxe_brighter_days_ahead": "https://i.ibb.co/4c6G5vz/ariana-grande-eternal-sunshine-deluxe-brighter-days-ahead.png",
    "ariana_grande_eternal_sunshine": "https://i.ibb.co/4c6G5vz/ariana-grande-eternal-sunshine-deluxe-brighter-days-ahead.png",
    "charli_xcx_true_romance": "https://i.ibb.co/6RL0H3z7/charli-xcx-true-romance.png",
    "charli_xcx_sucker": "https://i.ibb.co/5hGfpbjv/charli-xcx-sucker.png",
    "lana_del_rey_honeymoon": "https://i.ibb.co/C3G3kZkB/lana-del-rey-honeymoon.webp",
    "lana_del_rey_chemtrails_over_the_country_club": "https://i.ibb.co/1JzHvz72/lana-del-rey-chemtrails-over-the-country-club.webp",
    "lana_del_rey_chemtrails": "https://i.ibb.co/1JzHvz72/lana-del-rey-chemtrails-over-the-country-club.webp",
    "taylor_swift_folklore_deluxe_version": "https://i.ibb.co/jP5Y33rp/taylor-swift-folklore-deluxe-version.png",
    "sophie_oil_of_every_pearls_un_insides_non_stop_remix_album": "https://i.ibb.co/MQRrm0z/sophie-oil-of-every-pearls-un-insides-non-stop-remix-album.png",
    "sophie_oil_of_every_pearls_un_insides": "https://i.ibb.co/MQRrm0z/sophie-oil-of-every-pearls-un-insides-non-stop-remix-album.png",
  };
  
  if (DIRECT_URLS[key]) {
    return DIRECT_URLS[key];
  }
  
  return `https://i.ibb.co/${key}.png`;
}

export async function fetchAlbumCover(artist: string, title: string): Promise<string | undefined> {
  return getImgbbCoverUrl(artist, title);
}

// Fixed Professional Critic Reviews Map for iconic albums
const CRITIC_REVIEWS: Record<string, string> = {
  "vespertine": "Một kiệt tác dịu dàng và nội tâm, nơi Björk dệt nên giấc mơ điện tử vi tế từ những âm thanh micro-beat và dàn dây lộng lẫy để tôn vinh sự thiêng liêng của tình yêu.",
  "impossible princess": "Trải nghiệm nghệ thuật mang tính cá nhân và táo bạo nhất của Kylie, thử nghiệm thành công với trip-hop, electronica và indie-pop để phơi bày những lát cắt nội tâm sâu sắc nhất.",
  "confessions on a dance floor": "Một thánh đường disco-house liền mạch tuyệt vời, đỉnh cao sáng tạo của thế kỷ XXI nơi Madonna biến sàn khiêu vũ thành không gian cứu rỗi tâm hồn.",
  "brat": "Tuyên ngôn pop thô ráp, hỗn loạn và chân thật đến tột cùng của thế kỷ mới; di sản của Charli xcx trong việc giải cấu trúc hyperpop và định hình lại văn hóa đại chúng.",
  "did you know that there's a tunnel under ocean blvd": "Một thiên tiểu thuyết âm nhạc đậm chất tự truyện đầy chất thơ của Lana Del Rey, đào sâu vào lịch sử gia đình, ký ức cô quạnh và những khát khao hiện sinh trong trẻo.",
  "ray of light": "Bước chuyển mình vĩ đại đưa Madonna chạm tới đỉnh cao tâm linh thông qua sự kết hợp xuất thần của đạo Phật, Kabbalah, nhạc electronica u tối và ambient trip-hop.",
  "pure heroine": "Tuyệt tác tối giản nắm bắt trọn vẹn sự thờ ơ, nỗi cô đơn u uất và khao khát khẳng định bản thân của tuổi vị thành niên, tái định hình cấu trúc âm nhạc pop hiện đại.",
  "ái": "Một dấu mốc vàng son của R&B/Pop Việt Nam, nơi tlinh phô diễn tư duy giai điệu gợi cảm đầy nữ tính và góc nhìn trưởng thành mãnh liệt về bản chất của tình yêu.",
  "norman fucking rockwell!": "Đỉnh cao sự nghiệp chói lịu của Lana Del Rey, một bản cáo chung tuyệt đẹp dành cho giấc mơ Mỹ được bao bọc bởi những phím đàn piano cổ điển và những câu ca dao thời thượng.",
  "giữa một vạn người": "Một kỳ quan City Pop Việt hóa chuẩn mực, khẳng định tài năng viết lách đỉnh cao và giọng ca biến ảo của Phùng Khánh Linh lồng lộng trong những nhịp đập lung linh rực rỡ.",
  "erotica (pa version)": "Tác phẩm mang tính cách mạng bộc trực nhất về tình dục và tính nữ, thách thức mọi tabu xã hội bằng những nhịp điệu đen tối, gai góc của jazz-house và trip-hop.",
  "gag order": "Sự thăng hoa tột bậc từ nỗi đau tăm tối; album art-pop giàu chiều sâu giúp Kesha rũ bỏ quá khứ để tìm lại tiếng nói chân thực thông qua những thanh âm acoustic mộc mạc.",
  "eusexua": "Một cuộc đại cách mạng về âm thanh nơi FKA twigs hòa quyện nhạc điện tử thể nghiệm với nhịp đập techno dồn dập, phác họa trạng thái thăng hoa tinh khiết nhất của thể xác và tâm hồn.",
  "fever": "Đỉnh cao tinh hoa của Dance-Pop toàn cầu, một cỗ máy tạo hit không tì vết đầy sang trọng và quyến rũ vượt thời gian.",
  "đánh đổi": "Tác phẩm Hip-hop tự sự gai góc và chân thực bậc nhất của âm nhạc Việt, kể lại hành trình trưởng thành ngột ngạt cùng những hy sinh trong cuộc chiến danh vọng.",
  "loi choi: the neo pop punk": "Cú hích ngông cuồng làm đảo lộn sân chơi Việt Pop, nơi Wren Evans tự do pha trộn disco, punk, R&B thành một dòng chảy năng lượng trẻ hóa rực lửa.",
  "hit me hard and soft": "Sự phát triển vượt bậc của chị em nhà Eilish, bẻ gãy mọi quy chuẩn cấu trúc bài hát thông thường bằng sự đối nghịch hoàn hảo giữa lời thì thầm mộng mị và những nhịp bass bùng nổ.",
  "oil of every pearl's un-insides": "Một kỳ quan hyperpop cấp tiến mở đường cho tương lai, thách thức các khái niệm giới tính và căn sắc thông qua những kết cấu âm thanh tổng hợp siêu việt."
};

/**
 * Deterministically generates an authentic, professional 1-2 sentence music critic review and perspective 
 * based on the album id, artist, and title. Follows the highest Vietnamese music editorial standard.
 */
export function getAlbumCriticReview(artist: string, title: string, id?: number): string {
  const normTitle = (title || "").toLowerCase().trim();
  const normArtist = (artist || "").toLowerCase().trim();
  
  // 1. Check if we have exact match in pre-curated map
  for (const [key, val] of Object.entries(CRITIC_REVIEWS)) {
    if (normTitle.includes(key) || key.includes(normTitle)) {
      return val;
    }
  }

  // 2. Select elegant template deterministically based on hash of title + artist
  const textSeed = `${artist} - ${title}`;
  let hash = 0;
  for (let i = 0; i < textSeed.length; i++) {
    hash = (hash << 5) - hash + textSeed.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  const index = Math.abs(hash) % 5;

  const templates = [
    `Một hành trình nghệ thuật đột phá, pha trộn hoàn hảo cấu trúc âm thanh hiện đại rực rỡ và những suy tư nội tâm thấu suốt của ${artist} qua ${title}.`,
    `Tác phẩm tiêu biểu cho tinh thần tiên phong đầy nhạc tính, ${title} một lần nữa khẳng định di sản bền vững và sức biểu cảm phi thường của ${artist}.`,
    `${title} mở ra một không gian âm nhạc tràn ngập cảm xúc, nơi ${artist} biểu đạt xuất sắc tầm nhìn nghệ thuật độc đáo và tư duy hòa âm thời thượng.`,
    `Pha trộn tinh tế giữa sự mộc mạc đời thường và tư duy khái niệm đẳng cấp, tác phẩm ${title} của ${artist} xứng đáng là một điểm sáng chói lọi trong dòng chảy nghệ thuật đương đại.`,
    `Sức hấp dẫn mãnh liệt từ ${title} đến từ những thử nghiệm âm thanh táo bạo và khả năng kết nối cảm xúc kỳ diệu của ${artist} với người nghe đại chúng.`
  ];

  return templates[index];
}
