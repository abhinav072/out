/*
 * Portfolio data — the only file you need to touch to add, remove or re-caption photos.
 *   src:   Cloudinary path after ".../image/upload/"
 *   cat:   Landscape | Street | Architecture | Event | AI
 *   title: short caption shown on hover and in the lightbox
 *   r:     width / height (keeps the grid from jumping while images load)
 */
window.PHOTOS = [
  { src: "v1742877950/ABS08914_fatecw.jpg", cat: "Landscape", title: "Where the river bends", r: 1.78 },
  { src: "v1742877962/ABS04056_z14dh7.webp", cat: "Architecture", title: "Sandstone & spires", r: 1.5 },
  { src: "v1742877944/DSC08063_whgej1.jpg", cat: "Street", title: "Faces at the window", r: 1.33 },
  { src: "v1744020706/ABS00802_btisg9.webp", cat: "Event", title: "Full voice", r: 0.67 },
  { src: "v1743219604/lion_3_hpume6.jpg", cat: "AI", title: "Pride", r: 0.78 },
  { src: "v1742877966/ABS09416_mhqfes.webp", cat: "Landscape", title: "Crimson horizon", r: 1.5 },
  { src: "v1742877963/ABS03788_akgvho.webp", cat: "Architecture", title: "Minaret", r: 1.44 },
  { src: "v1742877951/ABS03989_rp0gns.webp", cat: "Street", title: "From above", r: 0.67 },
  { src: "v1744020484/ABS09982_obvmyk.jpg", cat: "Event", title: "Mid-performance", r: 0.67 },
  { src: "v1743181104/eagle_2_qbfxta.jpg", cat: "AI", title: "Gaze", r: 0.78 },
  { src: "v1742877964/ABS08962_qfy15s.webp", cat: "Landscape", title: "Golden rows", r: 0.67 },
  { src: "v1742877961/18-1_tsxrrv.webp", cat: "Architecture", title: "Guardian", r: 0.75 },
  { src: "v1742843677/20230715_164434_qmhtpn.jpg", cat: "Street", title: "Monsoon fields", r: 0.8 },
  { src: "v1742877964/ABS09474_xaxxfs.webp", cat: "Event", title: "Halo", r: 0.67 },
  { src: "v1743219492/swan2_tdfbac.jpg", cat: "AI", title: "Morning mist", r: 0.78 },
  { src: "v1742877961/ABS09305_dkqri7.webp", cat: "Landscape", title: "Lone crossing", r: 1.5 },
  { src: "v1743191314/ABS02494_crg4e2.webp", cat: "Architecture", title: "Lit for the night", r: 1.5 },
  { src: "v1742877970/20221029_164231_twmrw1.jpg", cat: "Street", title: "Smoke & sun", r: 0.75 },
  { src: "v1744020496/ABS09812_upy5hm.jpg", cat: "Event", title: "Under the lights", r: 0.67 },
  { src: "v1743219752/forest_2_aleutk.jpg", cat: "AI", title: "Valley light", r: 0.78 },
  { src: "v1742877966/ABS08923_ve7qyj.webp", cat: "Landscape", title: "Causeway", r: 1.78 },
  { src: "v1742877969/ABS03779_uw6mmc.webp", cat: "Architecture", title: "Through the arch", r: 1.5 },
  { src: "v1742843670/71_svfdav.jpg", cat: "Street", title: "Crowd study", r: 1.5 },
  { src: "v1744032764/ABS00598_f9alje.jpg", cat: "Event", title: "Backline", r: 1.5 },
  { src: "v1743219492/swan_2_iudqds.jpg", cat: "AI", title: "Still water", r: 0.78 },
  { src: "v1742877948/ABS03191_wzvccq.jpg", cat: "Landscape", title: "Bridges in the haze", r: 1.5 },
  { src: "v1742877969/ABS09294-Pano_btgjvn.webp", cat: "Architecture", title: "Moonrise arch", r: 1.5 },
  { src: "v1742972994/1701192218763_m0yon4.jpg", cat: "Street", title: "Procession", r: 0.75 },
  { src: "v1744020707/ABS00874_q12t77.webp", cat: "Event", title: "Front row", r: 1.5 },
  { src: "v1743219604/tiger2_ecs4be.jpg", cat: "AI", title: "Stripes", r: 0.78 },
  { src: "v1742877954/ABS09209_dy2t9p.webp", cat: "Landscape", title: "Autumn grove", r: 1.5 },
  { src: "v1742843709/PicsArt_12-06-07.42.57_r8q7i6.jpg", cat: "Architecture", title: "After dark", r: 0.75 },
  { src: "v1742843670/69_sg8cnx.jpg", cat: "Street", title: "Faces in the crowd", r: 1.5 },
  { src: "v1742843693/ABS09475-2_b7ilin.jpg", cat: "Event", title: "Rim light", r: 0.67 },
  { src: "v1743181090/eagle_5_pkee4w.jpg", cat: "AI", title: "In flight", r: 0.78 },
  { src: "v1742877957/ABS03997_l5dytz.webp", cat: "Landscape", title: "Pontoon morning", r: 1.5 },
  { src: "v1743191317/ABS03579_izolrk.webp", cat: "Architecture", title: "Riverside fort", r: 1.5 },
  { src: "v1742877954/ABS02214_ipcqfo.webp", cat: "Street", title: "Lamp on the river", r: 1.5 },
  { src: "v1742877948/DSC01154_bc5nmc.jpg", cat: "Event", title: "The crowd", r: 1.5 },
  { src: "v1743219773/star_kas95y.jpg", cat: "AI", title: "Star trails", r: 1.29 },
  { src: "v1742843706/IMG_6744_1_nzldhi.jpg", cat: "Landscape", title: "Tree in the fog", r: 0.75 },
  { src: "v1743191141/ABS03716_xp5xqh.webp", cat: "Architecture", title: "Domes", r: 1.5 },
  { src: "v1742927160/1701536275855_hnzigk.jpg", cat: "Street", title: "Golden hour boats", r: 0.75 },
  { src: "v1744020705/ABS00458_pasc8r.webp", cat: "Event", title: "Hands up", r: 0.67 },
  { src: "v1743219765/forest_1_iy7vv8.jpg", cat: "AI", title: "First light", r: 0.78 },
  { src: "v1742877957/ABS09032_cc55ue.webp", cat: "Landscape", title: "Lone tree", r: 1.5 },
  { src: "v1742877946/IMG_4843_spdkcy.jpg", cat: "Architecture", title: "After the rain", r: 1.33 },
  { src: "v1742987456/20231113_191817_ewawnp.jpg", cat: "Street", title: "Flashlight", r: 0.75 },
  { src: "v1742877946/IMG_6909_mw2g3l.jpg", cat: "Event", title: "Blue on stage", r: 0.75 },
  { src: "v1743180958/ai_2_xhchpj.jpg", cat: "AI", title: "Tree at sunset", r: 0.78 },
  { src: "v1742959584/ABS09222-Edit_z2akec.jpg", cat: "Street", title: "Walking home", r: 0.67 },
  { src: "v1744032911/ABS00773_jklhga.webp", cat: "Event", title: "Soundcheck", r: 0.67 },
  { src: "v1742973119/DSC07259_1_xqltua.jpg", cat: "Street", title: "Playground", r: 1.46 }
];

/* Cloudinary URL helper: resizes + picks the best format (AVIF/WebP) per browser. */
window.cld = function (path, w) {
  return "https://res.cloudinary.com/ddw247yht/image/upload/f_auto,q_auto,w_" + w + ",c_limit/" + path;
};
