// ---------------------------------------------------------------------------
// INDEKS ROZPOZNAWCZY
//
// Po co to jest: Pl@ntNet rozpoznaje kilkadziesiąt tysięcy gatunków, a pełnych
// haseł mamy kilkadziesiąt. Bez tego indeksu wszystko spoza zielnika wracało
// jako samo "Achillea millefolium, 74%" — łacina i procent, zero treści.
// Teraz wraca polska nazwa, rodzina i informacja, czy roślina ma w ogóle
// udokumentowane użycie lecznicze.
//
// Format: łacina | polska | rodzina | L
//   L = 1  — ma udokumentowane użycie lecznicze albo zielarskie
//   L = 0  — brak takiej wzmianki (nie znaczy: bezpieczna)
//   L = T  — TRUJĄCA, hasło ostrzegawcze
//
// Dopisywanie: dorzuć linijkę. Nie musi być pełnego hasła — sama nazwa już
// sprawia, że rozpoznanie przestaje być ślepe.
// ---------------------------------------------------------------------------

const RAW = `
Achillea millefolium|krwawnik pospolity|Asteraceae|1
Aegopodium podagraria|podagrycznik pospolity|Apiaceae|1
Aesculus hippocastanum|kasztanowiec zwyczajny|Sapindaceae|1
Aethusa cynapium|blekot pospolity|Apiaceae|T
Agrimonia eupatoria|rzepik pospolity|Rosaceae|1
Ajuga reptans|dąbrówka rozłogowa|Lamiaceae|1
Alchemilla vulgaris|przywrotnik pospolity|Rosaceae|1
Alliaria petiolata|czosnaczek pospolity|Brassicaceae|1
Allium ursinum|czosnek niedźwiedzi|Amaryllidaceae|1
Alnus glutinosa|olsza czarna|Betulaceae|1
Anemone nemorosa|zawilec gajowy|Ranunculaceae|T
Angelica archangelica|arcydzięgiel litwor|Apiaceae|1
Angelica sylvestris|dzięgiel leśny|Apiaceae|1
Anthriscus sylvestris|trybula leśna|Apiaceae|0
Arctium lappa|łopian większy|Asteraceae|1
Armoracia rusticana|chrzan pospolity|Brassicaceae|1
Artemisia absinthium|bylica piołun|Asteraceae|1
Artemisia vulgaris|bylica pospolita|Asteraceae|1
Asarum europaeum|kopytnik pospolity|Aristolochiaceae|T
Atropa belladonna|pokrzyk wilcza jagoda|Solanaceae|T
Ballota nigra|mierznica czarna|Lamiaceae|1
Bellis perennis|stokrotka pospolita|Asteraceae|1
Berberis vulgaris|berberys zwyczajny|Berberidaceae|1
Betula pendula|brzoza brodawkowata|Betulaceae|1
Bryonia alba|przestęp biały|Cucurbitaceae|T
Calendula officinalis|nagietek lekarski|Asteraceae|1
Calluna vulgaris|wrzos zwyczajny|Ericaceae|1
Caltha palustris|knieć błotna|Ranunculaceae|T
Campanula patula|dzwonek rozpierzchły|Campanulaceae|0
Capsella bursa-pastoris|tasznik pospolity|Brassicaceae|1
Cardamine pratensis|rzeżucha łąkowa|Brassicaceae|1
Carum carvi|kminek zwyczajny|Apiaceae|1
Centaurea cyanus|chaber bławatek|Asteraceae|1
Centaurium erythraea|centuria pospolita|Gentianaceae|1
Chelidonium majus|glistnik jaskółcze ziele|Papaveraceae|T
Chenopodium album|komosa biała|Amaranthaceae|1
Cichorium intybus|cykoria podróżnik|Asteraceae|1
Cirsium arvense|ostrożeń polny|Asteraceae|0
Colchicum autumnale|zimowit jesienny|Colchicaceae|T
Conium maculatum|szczwół plamisty|Apiaceae|T
Consolida regalis|ostróżeczka polna|Ranunculaceae|T
Convallaria majalis|konwalia majowa|Asparagaceae|T
Convolvulus arvensis|powój polny|Convolvulaceae|0
Cornus mas|dereń jadalny|Cornaceae|1
Corylus avellana|leszczyna pospolita|Betulaceae|1
Crataegus monogyna|głóg jednoszyjkowy|Rosaceae|1
Crataegus laevigata|głóg dwuszyjkowy|Rosaceae|1
Cynoglossum officinale|ostrzeń pospolity|Boraginaceae|T
Datura stramonium|bieluń dziędzierzawa|Solanaceae|T
Daucus carota|marchew zwyczajna|Apiaceae|1
Digitalis purpurea|naparstnica purpurowa|Plantaginaceae|T
Dryopteris filix-mas|nerecznica samcza|Dryopteridaceae|T
Echium vulgare|żmijowiec zwyczajny|Boraginaceae|0
Epilobium angustifolium|wierzbówka kiprzyca|Onagraceae|1
Equisetum arvense|skrzyp polny|Equisetaceae|1
Equisetum palustre|skrzyp błotny|Equisetaceae|T
Erigeron annuus|przymiotno białe|Asteraceae|0
Euphorbia cyparissias|wilczomlecz sosnka|Euphorbiaceae|T
Fagus sylvatica|buk zwyczajny|Fagaceae|0
Filipendula ulmaria|wiązówka błotna|Rosaceae|1
Foeniculum vulgare|koper włoski|Apiaceae|1
Fragaria vesca|poziomka pospolita|Rosaceae|1
Frangula alnus|kruszyna pospolita|Rhamnaceae|1
Fraxinus excelsior|jesion wyniosły|Oleaceae|1
Galeopsis tetrahit|poziewnik szorstki|Lamiaceae|1
Galium aparine|przytulia czepna|Rubiaceae|1
Galium odoratum|marzanka wonna|Rubiaceae|1
Galium verum|przytulia właściwa|Rubiaceae|1
Geranium robertianum|bodziszek cuchnący|Geraniaceae|1
Geum urbanum|kuklik pospolity|Rosaceae|1
Glechoma hederacea|bluszczyk kurdybanek|Lamiaceae|1
Hedera helix|bluszcz pospolity|Araliaceae|1
Helianthus tuberosus|słonecznik bulwiasty|Asteraceae|0
Heracleum sphondylium|barszcz zwyczajny|Apiaceae|1
Heracleum sosnowskyi|barszcz Sosnowskiego|Apiaceae|T
Hieracium pilosella|jastrzębiec kosmaczek|Asteraceae|1
Humulus lupulus|chmiel zwyczajny|Cannabaceae|1
Hyoscyamus niger|lulek czarny|Solanaceae|T
Hypericum maculatum|dziurawiec czteroboczny|Hypericaceae|1
Hypericum perforatum|dziurawiec zwyczajny|Hypericaceae|1
Impatiens noli-tangere|niecierpek pospolity|Balsaminaceae|0
Inula helenium|oman wielki|Asteraceae|1
Juglans regia|orzech włoski|Juglandaceae|1
Juniperus communis|jałowiec pospolity|Cupressaceae|1
Knautia arvensis|świerzbnica polna|Caprifoliaceae|1
Lamium album|jasnota biała|Lamiaceae|1
Lamium purpureum|jasnota purpurowa|Lamiaceae|1
Lavandula angustifolia|lawenda wąskolistna|Lamiaceae|1
Leonurus cardiaca|serdecznik pospolity|Lamiaceae|1
Leucanthemum vulgare|jastrun właściwy|Asteraceae|0
Levisticum officinale|lubczyk ogrodowy|Apiaceae|1
Linaria vulgaris|lnica pospolita|Plantaginaceae|1
Lotus corniculatus|komonica zwyczajna|Fabaceae|0
Lycopodium clavatum|widłak goździsty|Lycopodiaceae|1
Lysimachia nummularia|tojeść rozesłana|Primulaceae|1
Lythrum salicaria|krwawnica pospolita|Lythraceae|1
Malva sylvestris|ślaz dziki|Malvaceae|1
Matricaria chamomilla|rumianek pospolity|Asteraceae|1
Matricaria discoidea|rumianek bezpromieniowy|Asteraceae|1
Medicago sativa|lucerna siewna|Fabaceae|1
Melilotus officinalis|nostrzyk żółty|Fabaceae|1
Melissa officinalis|melisa lekarska|Lamiaceae|1
Mentha aquatica|mięta nadwodna|Lamiaceae|1
Mentha arvensis|mięta polna|Lamiaceae|1
Mentha x piperita|mięta pieprzowa|Lamiaceae|1
Menyanthes trifoliata|bobrek trójlistkowy|Menyanthaceae|1
Myosotis arvensis|niezapominajka polna|Boraginaceae|0
Nuphar lutea|grążel żółty|Nymphaeaceae|1
Nymphaea alba|grzybienie białe|Nymphaeaceae|1
Oenothera biennis|wiesiołek dwuletni|Onagraceae|1
Ononis arvensis|wilżyna ciernista|Fabaceae|1
Origanum vulgare|lebiodka pospolita|Lamiaceae|1
Oxalis acetosella|szczawik zajęczy|Oxalidaceae|1
Papaver rhoeas|mak polny|Papaveraceae|1
Papaver somniferum|mak lekarski|Papaveraceae|1
Paris quadrifolia|czworolist pospolity|Melanthiaceae|T
Pastinaca sativa|pasternak zwyczajny|Apiaceae|1
Petasites hybridus|lepiężnik różowy|Asteraceae|T
Peucedanum oreoselinum|gorysz pagórkowy|Apiaceae|0
Picea abies|świerk pospolity|Pinaceae|1
Pimpinella saxifraga|biedrzeniec mniejszy|Apiaceae|1
Pinus sylvestris|sosna zwyczajna|Pinaceae|1
Plantago lanceolata|babka lancetowata|Plantaginaceae|1
Plantago major|babka zwyczajna|Plantaginaceae|1
Plantago media|babka średnia|Plantaginaceae|1
Polygonatum odoratum|kokoryczka wonna|Asparagaceae|T
Polygonum aviculare|rdest ptasi|Polygonaceae|1
Populus nigra|topola czarna|Salicaceae|1
Populus tremula|topola osika|Salicaceae|1
Potentilla anserina|pięciornik gęsi|Rosaceae|1
Potentilla erecta|pięciornik kurze ziele|Rosaceae|1
Primula veris|pierwiosnek lekarski|Primulaceae|1
Prunella vulgaris|głowienka pospolita|Lamiaceae|1
Prunus padus|czeremcha zwyczajna|Rosaceae|1
Prunus spinosa|śliwa tarnina|Rosaceae|1
Pulmonaria officinalis|miodunka plamista|Boraginaceae|1
Quercus robur|dąb szypułkowy|Fagaceae|1
Ranunculus acris|jaskier ostry|Ranunculaceae|T
Ranunculus ficaria|ziarnopłon wiosenny|Ranunculaceae|T
Rhamnus cathartica|szakłak pospolity|Rhamnaceae|1
Rhododendron tomentosum|bagno zwyczajne|Ericaceae|T
Ribes nigrum|porzeczka czarna|Grossulariaceae|1
Rosa canina|róża dzika|Rosaceae|1
Rubus caesius|jeżyna popielica|Rosaceae|1
Rubus fruticosus|jeżyna fałdowana|Rosaceae|1
Rubus idaeus|malina właściwa|Rosaceae|1
Rumex acetosa|szczaw zwyczajny|Polygonaceae|1
Rumex crispus|szczaw kędzierzawy|Polygonaceae|1
Ruta graveolens|ruta zwyczajna|Rutaceae|T
Salix alba|wierzba biała|Salicaceae|1
Salix caprea|wierzba iwa|Salicaceae|1
Salvia officinalis|szałwia lekarska|Lamiaceae|1
Salvia pratensis|szałwia łąkowa|Lamiaceae|1
Sambucus ebulus|bez hebd|Adoxaceae|T
Sambucus nigra|bez czarny|Adoxaceae|1
Sambucus racemosa|bez koralowy|Adoxaceae|T
Sanguisorba officinalis|krwiściąg lekarski|Rosaceae|1
Saponaria officinalis|mydlnica lekarska|Caryophyllaceae|1
Scrophularia nodosa|trędownik bulwiasty|Scrophulariaceae|1
Sedum acre|rozchodnik ostry|Crassulaceae|T
Sempervivum tectorum|rojnik murowy|Crassulaceae|1
Senecio jacobaea|starzec jakubek|Asteraceae|T
Silybum marianum|ostropest plamisty|Asteraceae|1
Solanum dulcamara|psianka słodkogórz|Solanaceae|T
Solanum nigrum|psianka czarna|Solanaceae|T
Solidago virgaurea|nawłoć pospolita|Asteraceae|1
Sorbus aucuparia|jarząb pospolity|Rosaceae|1
Stellaria media|gwiazdnica pospolita|Caryophyllaceae|1
Symphytum officinale|żywokost lekarski|Boraginaceae|1
Tanacetum vulgare|wrotycz pospolity|Asteraceae|T
Taraxacum officinale|mniszek lekarski|Asteraceae|1
Taxus baccata|cis pospolity|Taxaceae|T
Thymus pulegioides|macierzanka zwyczajna|Lamiaceae|1
Thymus serpyllum|macierzanka piaskowa|Lamiaceae|1
Thymus vulgaris|tymianek pospolity|Lamiaceae|1
Tilia cordata|lipa drobnolistna|Malvaceae|1
Tilia platyphyllos|lipa szerokolistna|Malvaceae|1
Trifolium pratense|koniczyna łąkowa|Fabaceae|1
Trifolium repens|koniczyna biała|Fabaceae|1
Tussilago farfara|podbiał pospolity|Asteraceae|1
Typha latifolia|pałka szerokolistna|Typhaceae|1
Urtica dioica|pokrzywa zwyczajna|Urticaceae|1
Urtica urens|pokrzywa żegawka|Urticaceae|1
Vaccinium myrtillus|borówka czarna|Ericaceae|1
Vaccinium uliginosum|borówka bagienna|Ericaceae|0
Vaccinium vitis-idaea|borówka brusznica|Ericaceae|1
Valeriana officinalis|kozłek lekarski|Caprifoliaceae|1
Verbascum densiflorum|dziewanna wielkokwiatowa|Scrophulariaceae|1
Verbascum nigrum|dziewanna pospolita|Scrophulariaceae|1
Verbena officinalis|werbena pospolita|Verbenaceae|1
Veronica officinalis|przetacznik leśny|Plantaginaceae|1
Viburnum opulus|kalina koralowa|Adoxaceae|1
Vinca minor|barwinek pospolity|Apocynaceae|T
Viola odorata|fiołek wonny|Violaceae|1
Viola tricolor|fiołek trójbarwny|Violaceae|1
Viscum album|jemioła pospolita|Santalaceae|1
`;

// Parsujemy raz, przy pierwszym imporcie. Format tekstowy zamiast tablicy
// obiektów to około trzy razy mniejszy plik i lepsza kompresja — na wolnym
// LTE to realna różnica w czasie startu.
export const SPECIES_INDEX = RAW.trim()
  .split("\n")
  .map((line) => {
    const [nameLat, namePl, rodzina, flag] = line.split("|");
    return {
      nameLat,
      namePl,
      rodzina,
      lecznicza: flag === "1",
      trujaca: flag === "T",
    };
  });

// Klucz: rodzaj + gatunek, małymi literami. Pl@ntNet zwraca nazwy z autorem
// taksonu ("Matricaria chamomilla L."), a bywa też "×" w mieszańcach.
export function normalizeLatin(name) {
  if (!name) return "";
  return String(name)
    .replace(/×/g, "x")
    .split(/\s+/)
    .filter((w) => /^[a-zA-ZÀ-ÿ-]+$/.test(w))
    .slice(0, 2)
    .join(" ")
    .toLowerCase();
}

const BY_LATIN = new Map(
  SPECIES_INDEX.map((s) => [normalizeLatin(s.nameLat), s])
);

export function lookupSpecies(scientificName) {
  return BY_LATIN.get(normalizeLatin(scientificName)) || null;
}
