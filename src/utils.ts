import { Album } from "./data";

// Base URL for ImgBB direct image serving.
// When you upload your images to ImgBB and get the direct folder/hash, replace this constant value with your actual ImgBB base URL (e.g., https://i.ibb.co/your_hash).
export const IMGBB_BASE_URL = "https://i.ibb.co";

/**
 * Normalizes artist name and album title into a secure, standard URL filename syntax [artist]_[title].png.
 * Conversions: lowercases, strips Vietnamese accents/diacritics, removes non-alphanumeric special characters, replaces spaces/dashes with a single underscore.
 */
export function getImgbbCoverUrl(artist: string, title: string, size: 'full' | 'thumb' = 'full'): string {
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
  
  
  const THUMB_URLS: Record<string, string> = {
    "2pillz_pillzcasso": "https://i.ibb.co/gFBNnjf2/2pillz-pillzcasso.png",
    "addison_rae_addison": "https://i.ibb.co/Y4XXxyKF/addison-rae-addison.jpg",
    "adela_the_provocateur": "https://i.ibb.co/cSn6j13N/adela-the-provocateur.png",
    "amee_mongmee": "https://i.ibb.co/nMMZcnhy/amee-mongmee.png",
    "aphex_twin_selected_ambient_works_85_92": "https://i.ibb.co/C5cDhHL7/aphex-twin-selected-ambient-works-85-92.png",
    "arca_kick_ii": "https://i.ibb.co/PZNqjpbn/arca-kick-ii.png",
    "ariana_grande_dangerous_woman": "https://i.ibb.co/8gXWkxst/ariana-grande-dangerous-woman.jpg",
    "ariana_grande_eternal_sunshine": "https://i.ibb.co/99VbNzcc/ariana-grande-eternal-sunshine.png",
    "ariana_grande_eternal_sunshine_deluxe_brighter_days_ahead": "https://i.ibb.co/fbh5P6f/ariana-grande-eternal-sunshine-deluxe-brighter-days-ahead.png",
    "beach_house_depression_cherry": "https://i.ibb.co/3Ysr8j1x/beach-house-depression-cherry.png",
    "beyonce_beyonce_platinum_edition": "https://i.ibb.co/xSs4SQFJ/beyonce-beyonce-platinum-edition.png",
    "beyonce_cowboy_carter": "https://i.ibb.co/CsJM8b6g/beyonce-cowboy-carter.png",
    "beyonce_lemonade": "https://i.ibb.co/vxS1hsJz/beyonce-lemonade.png",
    "beyonce_renaissance": "https://i.ibb.co/vCL8V7Qy/beyonce-renaissance.png",
    "bich_phuong_dramatic": "https://i.ibb.co/BV8SYTTf/bich-phuong-dramatic.png",
    "bich_phuong_tam_trang_tan_hoi_cham_mot_chut": "https://i.ibb.co/spL4q0c8/bich-phuong-tam-trang-tan-hoi-cham-mot-chut.png",
    "bigdaddy_nhan_tran": "https://i.ibb.co/mMtRRdp/bigdaddy-nhan-tran.png",
    "billie_eilish_dont_smile_at_me": "https://i.ibb.co/DDx0wh47/billie-eilish-dont-smile-at-me.png",
    "billie_eilish_happier_than_ever": "https://i.ibb.co/83pPWyx/billie-eilish-happier-than-ever.png",
    "billie_eilish_hit_me_hard_and_soft": "https://i.ibb.co/VYLXpZ1x/billie-eilish-hit-me-hard-and-soft.png",
    "billie_eilish_when_we_all_fall_asleep_where_do_we_go": "https://i.ibb.co/ntRjF6B/billie-eilish-when-we-all-fall-asleep-where-do-we-go.png",
    "bjork_biophilia_deluxe_edition": "https://i.ibb.co/NnmnTDKp/bjork-biophilia-deluxe-edition.png",
    "bjork_debut": "https://i.ibb.co/bMkN3skT/bjork-debut.png",
    "bjork_fossora": "https://i.ibb.co/Y7cQLyT6/bjork-fossora.png",
    "bjork_homogenic": "https://i.ibb.co/fd5TBBBj/bjork-homogenic.webp",
    "bjork_post": "https://i.ibb.co/TDww8ytB/bjork-post.png",
    "bjork_vespertine": "https://i.ibb.co/HDJp4Kxh/bjork-vespertine.png",
    "bjork_volta": "https://i.ibb.co/x8C3k0j9/bjork-volta.png",
    "bjork_vulnicura": "https://i.ibb.co/XxjymR86/bjork-vulnicura.png",
    "bjork_vulnicura_strings_the_acoustic_version_strings_voice_and_viola_organista_only": "https://i.ibb.co/Kjn0kd6L/bjork-vulnicura-strings-the-acoustic-version-strings-voice-and-viola-organista-only.png",
    "blood_orange_essex_honey": "https://i.ibb.co/gZ9T6rQm/blood-orange-essex-honey.png",
    "c418_minecraft_volume_alpha": "https://i.ibb.co/cXwMrT4f/c418-minecraft-volume-alpha.png",
    "c418_minecraft_volume_beta": "https://i.ibb.co/gLyMnrPQ/c418-minecraft-volume-beta.jpg",
    "camila_cabello_cxoxo": "https://i.ibb.co/GQzZR7rT/camila-cabello-cxoxo.png",
    "cardi_b_am_i_the_drama": "https://i.ibb.co/67kyV4XQ/cardi-b-am-i-the-drama.png",
    "caroline_polachek_desire_i_want_to_turn_into_you": "https://i.ibb.co/B5Y4mN44/caroline-polachek-desire-i-want-to-turn-into-you.png",
    "caroline_polachek_desire_i_want_to_turn_into_you_everasking_edition": "https://i.ibb.co/gLpQsN6F/caroline-polachek-desire-i-want-to-turn-into-you-everasking-edition.png",
    "chappell_roan_the_rise_and_fall_of_a_midwest_princess": "https://i.ibb.co/sdPFGvZB/chappell-roan-the-rise-and-fall-of-a-midwest-princess.png",
    "charli_xcx_brat": "https://i.ibb.co/RkypwqPJ/charli-xcx-brat.webp",
    "charli_xcx_brat_and_its_completely_different_but_also_still_brat": "https://i.ibb.co/27mVS30L/charli-xcx-brat-and-its-completely-different-but-also-still-brat.png",
    "charli_xcx_brat_and_its_the_same_but_theres_three_more_songs_so_its_not": "https://i.ibb.co/DPq9HCMk/charli-xcx-brat-and-its-the-same-but-theres-three-more-songs-so-its-not.png",
    "charli_xcx_charli": "https://i.ibb.co/1YfFzD9G/charli-xcx-charli.webp",
    "charli_xcx_crash_deluxe": "https://i.ibb.co/d4nn746h/charli-xcx-crash-deluxe.jpg",
    "charli_xcx_how_im_feeling_now": "https://i.ibb.co/fVD28ChX/charli-xcx-how-im-feeling-now.png",
    "charli_xcx_sucker": "https://i.ibb.co/0ymd4H9Z/charli-xcx-sucker.png",
    "charli_xcx_true_romance": "https://i.ibb.co/N6b2985d/charli-xcx-true-romance.png",
    "cupcakke_cum_cake": "https://i.ibb.co/bgG852Bs/cupcakke-cum-cake.png",
    "cupcakke_dauntless_manifesto": "https://i.ibb.co/F47vfbXG/cupcakke-dauntless-manifesto.png",
    "cupcakke_std": "https://i.ibb.co/FL69Vq4M/cupcakke-std.jpg",
    "cupcakke_the_bakkery": "https://i.ibb.co/6cWhrxKM/cupcakke-the-bakkery.png",
    "dakooka_dakooka": "https://i.ibb.co/hN9NZDy/dakooka-dakooka.png",
    "esthero_breath_from_another": "https://i.ibb.co/8LZB7kxj/esthero-breath-from-another.png",
    "fka_twigs_caprisongs": "https://i.ibb.co/39RcrW13/fka-twigs-caprisongs.png",
    "fka_twigs_eusexua": "https://i.ibb.co/fV3zpYyg/fka-twigs-eusexua.png",
    "fka_twigs_eusexua_afterglow": "https://i.ibb.co/kVc3WzWp/fka-twigs-eusexua-afterglow.png",
    "fka_twigs_lp1": "https://i.ibb.co/GfJvyBkw/fka-twigs-lp1.png",
    "fka_twigs_magdalene": "https://i.ibb.co/nsh9dfKv/fka-twigs-magdalene.png",
    "gigi_perez_at_the_beach_in_every_life_extended": "https://i.ibb.co/B5zvk91x/gigi-perez-at-the-beach-in-every-life-extended.png",
    "hoang_thuy_linh_hoang": "https://i.ibb.co/v4vHmyBv/hoang-thuy-linh-hoang.png",
    "hoang_thuy_linh_link": "https://i.ibb.co/r2LSqJCT/hoang-thuy-linh-link.png",
    "hoang_thuy_linh_vietnamese_concert_the_album": "https://i.ibb.co/dw61gph6/hoang-thuy-linh-vietnamese-concert-the-album.png",
    "imogen_heap_speak_for_yourself": "https://i.ibb.co/KjTkTGjs/imogen-heap-speak-for-yourself.png",
    "jade_thats_showbiz_baby": "https://i.ibb.co/27Rc5yWS/jade-thats-showbiz-baby.png",
    "japanese_breakfast_jubilee": "https://i.ibb.co/yc0qpN2y/japanese-breakfast-jubilee.png",
    "jessie_ware_whats_your_pleasure": "https://i.ibb.co/xtrfRLdr/jessie-ware-whats-your-pleasure.webp",
    "kali_uchis_red_moon_in_venus": "https://i.ibb.co/RksRBsry/kali-uchis-red-moon-in-venus.jpg",
    "kanye_west_graduation": "https://i.ibb.co/VYmTCfh7/kanye-west-graduation.png",
    "kelela_hallucinogen": "https://i.ibb.co/1Yfsyvww/kelela-hallucinogen.png",
    "kesha": "https://i.ibb.co/CKzrFBSz/kesha.png",
    "kesha_eat_the_acid": "https://i.ibb.co/yc7pg8TM/kesha-eat-the-acid.png",
    "kesha_gag_order": "https://i.ibb.co/Rp45NXdJ/kesha-gag-order.webp",
    "keshi_requiem_bonus_edition": "https://i.ibb.co/jZsQXGhH/keshi-requiem-bonus-edition.png",
    "kylie_minogue_aphrodite": "https://i.ibb.co/gZgsSyKq/kylie-minogue-aphrodite.png",
    "kylie_minogue_body_language": "https://i.ibb.co/BHKz94QV/kylie-minogue-body-language.png",
    "kylie_minogue_fever": "https://i.ibb.co/DHKk8Vjv/kylie-minogue-fever.png",
    "kylie_minogue_impossible_princess_deluxe_edition": "https://i.ibb.co/Kj5q4NhD/kylie-minogue-impossible-princess-deluxe-edition.webp",
    "kylie_minogue_kylie_minogue_special_edition": "https://i.ibb.co/FqBRBLSF/kylie-minogue-kylie-minogue-special-edition.jpg",
    "kylie_minogue_light_years": "https://i.ibb.co/3q3HDS8/kylie-minogue-light-years.png",
    "kylie_minogue_tension_deluxe": "https://i.ibb.co/rRcbxtff/kylie-minogue-tension-deluxe.png",
    "kylie_minogue_tension_ii": "https://i.ibb.co/b5jBd48k/kylie-minogue-tension-ii.png",
    "lady_gaga_mayhem": "https://i.ibb.co/sdCPMM2v/lady-gaga-mayhem.png",
    "lady_gaga_the_fame": "https://i.ibb.co/MkZZ3nVW/lady-gaga-the-fame.png",
    "lady_gaga_the_fame_monster_deluxe_edition": "https://i.ibb.co/Ldj5sfk6/lady-gaga-the-fame-monster-deluxe-edition.png",
    "lana_del_rey_blue_banisters": "https://i.ibb.co/rKwzbQ5f/lana-del-rey-blue-banisters.webp",
    "lana_del_rey_born_to_die_deluxe_version": "https://i.ibb.co/jvjGFsVj/lana-del-rey-born-to-die-deluxe-version.png",
    "lana_del_rey_born_to_die_paradise_edition_special_version": "https://i.ibb.co/m5dVNQSX/lana-del-rey-born-to-die-paradise-edition-special-version.jpg",
    "lana_del_rey_chemtrails_over_the_country_club": "https://i.ibb.co/R4jLvjYH/lana-del-rey-chemtrails-over-the-country-club.webp",
    "lana_del_rey_did_you_know_that_theres_a_tunnel_under_ocean_blvd": "https://i.ibb.co/21cjnJ6X/lana-del-rey-did-you-know-that-theres-a-tunnel-under-ocean-blvd.webp",
    "lana_del_rey_honeymoon": "https://i.ibb.co/Q3w32R29/lana-del-rey-honeymoon.webp",
    "lana_del_rey_lust_for_life": "https://i.ibb.co/M53Qqvyg/lana-del-rey-lust-for-life.webp",
    "lana_del_rey_norman_fucking_rockwell": "https://i.ibb.co/Y44pKsGS/lana-del-rey-norman-fucking-rockwell.webp",
    "lana_del_rey_ultraviolence_deluxe": "https://i.ibb.co/1Yp9tgmt/lana-del-rey-ultraviolence-deluxe.png",
    "lily_allen_west_end_girl": "https://i.ibb.co/Z6wh7rTL/lily-allen-west-end-girl.png",
    "lorde_melodrama": "https://i.ibb.co/JRnXSdpG/lorde-melodrama.png",
    "lorde_pure_heroine": "https://i.ibb.co/fVqZ8tn9/lorde-pure-heroine.webp",
    "lorde_pure_heroine_extended": "https://i.ibb.co/rKFs240h/lorde-pure-heroine-extended.png",
    "lorde_virgin": "https://i.ibb.co/zTntNbMK/lorde-virgin.png",
    "low_g_l2k": "https://i.ibb.co/LDHQLVbP/low-g-l2k.png",
    "madonna_american_life": "https://i.ibb.co/bgJWdspg/madonna-american-life.png",
    "madonna_bedtime_stories": "https://i.ibb.co/1GhM3Spz/madonna-bedtime-stories.png",
    "madonna_celebration": "https://i.ibb.co/nqL3qVmd/madonna-celebration.png",
    "madonna_confessions_on_a_dance_floor": "https://i.ibb.co/WNsWsYBX/madonna-confessions-on-a-dance-floor.png",
    "madonna_confessions_on_a_dance_floor_twenty_years_edition": "https://i.ibb.co/cKxvC49M/madonna-confessions-on-a-dance-floor-twenty-years-edition.png",
    "madonna_erotica_pa_version": "https://i.ibb.co/BVDD8pjD/madonna-erotica-pa-version.png",
    "madonna_hard_candy": "https://i.ibb.co/0pbYf8jw/madonna-hard-candy.png",
    "madonna_like_a_prayer": "https://i.ibb.co/rRkpr7fq/madonna-like-a-prayer.png",
    "madonna_madame_x_deluxe": "https://i.ibb.co/QvG3Mq44/madonna-madame-x-deluxe.png",
    "madonna_music": "https://i.ibb.co/bjd93CSf/madonna-music.png",
    "madonna_ray_of_light": "https://i.ibb.co/3m2c8rPw/madonna-ray-of-light.png",
    "madonna_rebel_heart_deluxe": "https://i.ibb.co/tg6bsGR/madonna-rebel-heart-deluxe.png",
    "marzuz_a": "https://i.ibb.co/jPqkgsKY/marzuz-a.png",
    "melanie_martinez_cry_baby_deluxe_edition": "https://i.ibb.co/6R3TRYKD/melanie-martinez-cry-baby-deluxe-edition.png",
    "melanie_martinez_k_12_after_school_deluxe_edition": "https://i.ibb.co/nsfJ38yd/melanie-martinez-k-12-after-school-deluxe-edition.png",
    "miley_cyrus_endless_summer_vacation": "https://i.ibb.co/21JDdrPX/miley-cyrus-endless-summer-vacation.png",
    "miley_cyrus_something_beautiful": "https://i.ibb.co/gL2PFbwJ/miley-cyrus-something-beautiful.png",
    "ms_lauryn_hill_the_miseducation_of_lauryn_hill": "https://i.ibb.co/fdzS3Rv0/ms-lauryn-hill-the-miseducation-of-lauryn-hill.png",
    "nelly_furtado_loose": "https://i.ibb.co/C5DRjxJc/nelly-furtado-loose.png",
    "ninajirachi_i_love_my_computer": "https://i.ibb.co/jvjd6p5T/ninajirachi-i-love-my-computer.png",
    "obito_danh_doi": "https://i.ibb.co/dCHLgP9/obito-danh-doi.png",
    "oklou_choke_enough": "https://i.ibb.co/4ZVN4cFq/oklou-choke-enough.png",
    "oklou_choke_enough_deluxe": "https://i.ibb.co/FLCJJwcf/oklou-choke-enough-deluxe.png",
    "olivia_rodrigo_guts_spilled": "https://i.ibb.co/cfRK8vw/olivia-rodrigo-guts-spilled.png",
    "olivia_rodrigo_sour": "https://i.ibb.co/zhdZgTTV/olivia-rodrigo-sour.png",
    "orange_camon": "https://i.ibb.co/hxbnfrZy/orange-camon.png",
    "phao_la_em": "https://i.ibb.co/1YnQTfGV/phao-la-em.jpg",
    "phung_khanh_linh_giua_mot_van_nguoi": "https://i.ibb.co/n8KVKYg3/phung-khanh-linh-giua-mot-van-nguoi.png",
    "phuong_my_chi_vu_tru_co_bay": "https://i.ibb.co/S4DrRqtY/phuong-my-chi-vu-tru-co-bay.png",
    "phuong_my_chi_vu_tru_co_bay_deluxe_version": "https://i.ibb.co/d4mVBJLr/phuong-my-chi-vu-tru-co-bay-deluxe-version.png",
    "phuong_my_chi_vu_tru_co_bay_school_tour_2024_version": "https://i.ibb.co/5XC0m1ks/phuong-my-chi-vu-tru-co-bay-school-tour-2024-version.png",
    "pinkpantheress_fancy_that": "https://i.ibb.co/hF8sb1Zf/pinkpantheress-fancy-that.png",
    "quang_quanh_quanh_choi": "https://i.ibb.co/27bpxtNd/quang-quanh-quanh-choi.png",
    "raye_this_music_may_contain_hope": "https://i.ibb.co/mFvmQ2D0/raye-this-music-may-contain-hope.png",
    "rina_sawayama_sawayama": "https://i.ibb.co/bMKwBq30/rina-sawayama-sawayama.webp",
    "robyn_honey": "https://i.ibb.co/B5c26pYK/robyn-honey.webp",
    "rosalia_lux": "https://i.ibb.co/fBDptRP/rosalia-lux.webp",
    "rosalia_lux_complete_works": "https://i.ibb.co/8DG45gwz/rosalia-lux-complete-works.png",
    "rose_gray_louder_please": "https://i.ibb.co/JRCcDPWq/rose-gray-louder-please.png",
    "rpt_mck_99": "https://i.ibb.co/XkpfxfMr/rpt-mck-99.png",
    "rusowsky_daisy": "https://i.ibb.co/tMcrJkhC/rusowsky-daisy.png",
    "shawn_mendes_handwritten_deluxe": "https://i.ibb.co/5X91DjjZ/shawn-mendes-handwritten-deluxe.png",
    "shawn_mendes_illuminate_deluxe": "https://i.ibb.co/5XKzczbv/shawn-mendes-illuminate-deluxe.png",
    "shawn_mendes_shawn_mendes_deluxe": "https://i.ibb.co/fzgn1Pz8/shawn-mendes-shawn-mendes-deluxe.webp",
    "slayyyter_wort_girl_in_america": "https://i.ibb.co/xKbBgw3Y/slayyyter-wort-girl-in-america.png",
    "sophie_oil_of_every_pearls_un_insides": "https://i.ibb.co/jtLjKc1/sophie-oil-of-every-pearls-un-insides.png",
    "sophie_oil_of_every_pearls_un_insides_non_stop_remix_album": "https://i.ibb.co/43jzHrb/sophie-oil-of-every-pearls-un-insides-non-stop-remix-album.png",
    "st_vincent_masseduction": "https://i.ibb.co/nMXKb11m/st-vincent-masseduction.png",
    "sufjan_stevens_carrie_lowell_10th_anniversary_edition": "https://i.ibb.co/RppnVNyn/sufjan-stevens-carrie-lowell-10th-anniversary-edition.jpg",
    "tate_mcrae_so_close_to_what": "https://i.ibb.co/RGdjkKVp/tate-mcrae-so-close-to-what.png",
    "taylor_swift_1989_taylors_version": "https://i.ibb.co/3YTLxh3K/taylor-swift-1989-taylors-version.png",
    "taylor_swift_evermore_deluxe_version": "https://i.ibb.co/RGWhN9mq/taylor-swift-evermore-deluxe-version.png",
    "taylor_swift_folklore_deluxe_version": "https://i.ibb.co/tTh6YYJd/taylor-swift-folklore-deluxe-version.png",
    "taylor_swift_reputation": "https://i.ibb.co/C3WXY33D/taylor-swift-reputation.png",
    "thang_cai_dau_tien": "https://i.ibb.co/nsPXjhQm/thang-cai-dau-tien.png",
    "thanh_dong_trong_im_o_lang": "https://i.ibb.co/0VtK7mCB/thanh-dong-trong-im-o-lang.png",
    "the_thien_tran_the": "https://i.ibb.co/wh2HdFfj/the-thien-tran-the.png",
    "the_weeknd_starboy_deluxe": "https://i.ibb.co/YTJpgtF4/the-weeknd-starboy-deluxe.png",
    "tinashe_quantum_baby": "https://i.ibb.co/hxDvYZ5p/tinashe-quantum-baby.png",
    "tlinh_ai": "https://i.ibb.co/HpzFrCcv/tlinh-ai.png",
    "tlinh_flvr": "https://i.ibb.co/bjsFgRwj/tlinh-flvr.png",
    "towa_tei_sound_museum": "https://i.ibb.co/rfzMVwM2/towa-tei-sound-museum.png",
    "tyla_tyla": "https://i.ibb.co/WwFmLR8/tyla-tyla.png",
    "tyler_the_creator_igor": "https://i.ibb.co/qLRKXGG1/tyler-the-creator-igor.jpg",
    "various_artists_call_me_by_your_name_original_motion_picture_soundtrack": "https://i.ibb.co/jktnZV9J/various-artists-call-me-by-your-name-original-motion-picture-soundtrack.png",
    "wren_evans_chieu_hom_ay_anh_thay_mau_do": "https://i.ibb.co/21jxqCwk/wren-evans-chieu-hom-ay-anh-thay-mau-do.png",
    "wren_evans_loi_choi_the_neo_pop_punk": "https://i.ibb.co/DHXbvJ2G/wren-evans-loi-choi-the-neo-pop-punk.png",
    "wren_evans_no": "https://i.ibb.co/jvfCbpgj/wren-evans-no.png",
    "zara_larsson_midnight_sun": "https://i.ibb.co/gML5r6xJ/zara-larsson-midnight-sun.png",
    "zara_larsson_midnight_sun_girls_trip": "https://i.ibb.co/nqmGHWGn/zara-larsson-midnight-sun-girls-trip.png",
  };
  
  const FULL_URLS: Record<string, string> = {
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
  
  const urls = size === 'thumb' ? THUMB_URLS : FULL_URLS;
  if (urls[key]) {
    return urls[key];
  }
  // Fallback map resolving
  if (size === 'thumb' && FULL_URLS[key]) return FULL_URLS[key];
  if (size === 'full' && THUMB_URLS[key]) return THUMB_URLS[key];

  return `https://i.ibb.co/${key}.png`;
}

export async function fetchAlbumCover(artist: string, title: string, size: 'full' | 'thumb' = 'full'): Promise<string | undefined> {
  return getImgbbCoverUrl(artist, title, size);
}

export interface ExtractedPalette {
  dominant: string;
  palette: string[];
}

// Hàm bổ trợ chuyển đổi màu RGB sang HEX
function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (val: number) => Math.max(0, Math.min(255, Math.round(val)));
  const hex = (x: number) => {
    const h = clamp(x).toString(16);
    return h.length === 1 ? "0" + h : h;
  };
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}

// 1. Lớp ColorThief độc lập, hiệu năng cao phục vụ phân tích điểm ảnh chuẩn xác trên môi trường Browser
export class ColorThief {
  getColor(canvas: HTMLCanvasElement): [number, number, number] {
    const ctx = canvas.getContext('2d');
    if (!ctx) return [0, 0, 0];
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    const colorMap: Record<string, { r: number; g: number; b: number; count: number }> = {};
    const step = 8; // Gom nhóm sắc độ gần nhau

    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 128) continue; // Bỏ qua pixel trong suốt
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const qr = Math.round(r / step) * step;
      const qg = Math.round(g / step) * step;
      const qb = Math.round(b / step) * step;
      const key = `${qr},${qg},${qb}`;

      if (!colorMap[key]) {
        colorMap[key] = { r, g, b, count: 0 };
      }
      colorMap[key].count++;
    }

    const colors = Object.values(colorMap).sort((a, b) => b.count - a.count);
    if (colors.length === 0) return [0, 0, 0];
    return [colors[0].r, colors[0].g, colors[0].b];
  }

  getPalette(canvas: HTMLCanvasElement, count = 5): [number, number, number][] {
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    const colorMap: Record<string, { r: number; g: number; b: number; count: number }> = {};
    const step = 16;

    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 128) continue;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const qr = Math.round(r / step) * step;
      const qg = Math.round(g / step) * step;
      const qb = Math.round(b / step) * step;
      const key = `${qr},${qg},${qb}`;

      if (!colorMap[key]) {
        colorMap[key] = { r, g, b, count: 0 };
      }
      colorMap[key].count++;
    }

    const sortedColors = Object.values(colorMap).sort((a, b) => b.count - a.count);
    const palette: [number, number, number][] = [];

    // Chọn ra các màu sắc khác nhau rõ rệt (khoảng cách màu Euclide)
    for (const c of sortedColors) {
      if (palette.length >= count) break;

      const isTooClose = palette.some(([pr, pg, pb]) => {
        const distance = Math.sqrt((c.r - pr) ** 2 + (c.g - pg) ** 2 + (c.b - pb) ** 2);
        return distance < 45; // Ngưỡng khác biệt tối thiểu
      });

      if (!isTooClose) {
        palette.push([c.r, c.g, c.b]);
      }
    }

    // Điền thêm các màu phổ biến nếu chưa đủ
    let index = 0;
    while (palette.length < count && index < sortedColors.length) {
      const c = sortedColors[index];
      const alreadyAdded = palette.some(([pr, pg, pb]) => pr === c.r && pg === c.g && pb === c.b);
      if (!alreadyAdded) {
        palette.push([c.r, c.g, c.b]);
      }
      index++;
    }

    return palette;
  }
}

export function getColorThiefDominant(imageUrl: string, targetSize = 120): Promise<ExtractedPalette> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Đặt thuộc tính crossorigin bắt buộc để tránh lỗi Tainted Canvas với ImgBB
    img.crossOrigin = "anonymous"; 
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetSize;
      canvas.height = targetSize;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error("Không thể tạo Context 2D"));
        return;
      }
      
      // Vẽ ảnh nén cực nhỏ để tăng tốc độ phân tích pixel
      ctx.drawImage(img, 0, 0, targetSize, targetSize);

      try {
        const colorThief = new ColorThief();
        // Đọc màu Dominant (chiếm ưu thế nhất) dạng mảng [r, g, b]
        const rgb = colorThief.getColor(canvas);
        const hex = rgbToHex(rgb[0], rgb[1], rgb[2]);
        
        // Lấy thêm bảng màu phối hợp (Palette gồm 5 màu phụ)
        const paletteRgb = colorThief.getPalette(canvas, 5);
        const paletteHex = paletteRgb.map((c: [number, number, number]) => rgbToHex(c[0], c[1], c[2]));

        resolve({
          dominant: hex,
          palette: paletteHex
        });
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error("Không thể tải ảnh"));
    img.src = imageUrl;
  });
}

// 2. Hàm điều khiển Batch Queue (Chạy đồng thời có giới hạn để chống đơ trình duyệt)
export async function processColorThiefBatch(
  urls: string[],
  concurrencyLimit = 4
): Promise<Array<{ url: string; dominant: string; palette: string[] }>> {
  const results: Array<{ url: string; dominant: string; palette: string[] }> = [];
  const executing = new Set<Promise<void>>();

  for (const url of urls) {
    const promise = getColorThiefDominant(url)
      .then((data) => {
        results.push({ url, dominant: data.dominant, palette: data.palette });
        executing.delete(promise);
      })
      .catch((err) => {
        console.error("Lỗi tải ảnh:", url, err);
        executing.delete(promise);
      });
    
    executing.add(promise);

    // Đợi bớt luồng nếu chạm giới hạn chạy song song
    if (executing.size >= concurrencyLimit) {
      await Promise.race(executing);
    }
  }
  
  await Promise.all(executing);
  return results;
}
