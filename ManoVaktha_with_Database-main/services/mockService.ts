// Mock service for testing when the Gemini API is not available
import { type Solution, type Language } from '../types';

export async function getMockSolutions(userProblem: string, language: Language): Promise<Solution[]> {
  console.log('🧪 Using mock service for problem:', userProblem.substring(0, 50) + '...');
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock solutions based on the language
  const mockSolutions: Record<Language, Solution[]> = {
    English: [
      {
        title: "The Wisdom of Lord Krishna",
        story: "When Arjuna was filled with doubt and confusion on the battlefield of Kurukshetra, Lord Krishna imparted the divine knowledge of the Bhagavad Gita. Similarly, in your situation, remember that clarity comes through selfless action without attachment to results. Focus on doing what is right, and let go of the anxiety about outcomes.",
        reference: "Bhagavad Gita, Chapter 2, Verse 47"
      },
      {
        title: "The Devotion of Prahlada",
        story: "The young Prahlada faced immense persecution from his father Hiranyakashipu, yet he remained steadfast in his devotion to Lord Vishnu. His unwavering faith protected him from all harm. In your struggle, cultivate inner strength through faith and perseverance, knowing that divine protection surrounds those who remain true to their path.",
        reference: "Srimad Bhagavatam, Canto 7"
      },
      {
        title: "The Patience of Lord Rama",
        story: "Lord Rama endured fourteen years of exile in the forest, away from his kingdom and loved ones, without complaint. His patience and adherence to dharma taught us that true strength lies in bearing difficulties with grace. In your current situation, practice patience and trust in the divine timing of events.",
        reference: "Valmiki Ramayana, Ayodhya Kanda"
      },
      {
        title: "The Humility of Lord Hanuman",
        story: "Lord Hanuman, despite his immense powers, always considered himself a humble servant of Lord Rama. His devotion without ego shows us that true power comes from humility. In your challenges, approach with humility and service, and you will find strength you never knew you had.",
        reference: "Tulsidas Ramcharitmanas, Sundar Kanda"
      },
      {
        title: "The Forgiveness of Lord Shiva",
        story: "When Kamadeva disturbed Lord Shiva's meditation, Shiva burned him to ashes with his third eye. Yet, when Kamadeva's wife pleaded, Shiva forgave and restored him. This teaches us that forgiveness is a divine quality that brings peace. Forgive those who have wronged you, and find peace within.",
        reference: "Shiva Purana, Rudra Samhita"
      },
      {
        title: "The Detachment of King Bali",
        story: "King Bali, despite being granted a boon by Lord Vishnu, showed complete surrender when Vishnu appeared as Vamana. His detachment from his kingdom and ego teaches us that true wealth is in letting go. Practice detachment from outcomes, and you will find true contentment.",
        reference: "Srimad Bhagavatam, Canto 8"
      },
      {
        title: "The Knowledge of Goddess Saraswati",
        story: "Goddess Saraswati, the deity of knowledge, teaches us that true wisdom comes from inner reflection, not just from books. In your situation, seek knowledge not just from external sources, but from your inner self. Meditate and reflect to find the answers within.",
        reference: "Devi Mahatmya, Markandeya Purana"
      },
      {
        title: "The Compassion of Lord Buddha",
        story: "Lord Buddha left his palace to seek enlightenment and spent his life teaching others the path to liberation from suffering. His compassion for all beings, including animals, shows us the power of empathy. In your struggles, extend compassion to others and yourself, and suffering will diminish.",
        reference: "Dhammapada, Verse 5"
      },
      {
        title: "The Strength of Draupadi",
        story: "Draupadi, despite being disrobed in the court, called upon Lord Krishna who saved her with divine grace. Her unwavering faith in dharma and the divine teaches us that in our darkest moments, faith can be our greatest protector. Call upon the divine in your times of need.",
        reference: "Mahabharata, Vana Parva"
      },
      {
        title: "The Contentment of Sage Valmiki",
        story: "Sage Valmiki transformed from a robber to a revered sage through meditation and devotion. His contentment in simple forest life teaches us that happiness is not dependent on external circumstances. Find contentment in simplicity, and you will discover true joy.",
        reference: "Valmiki Ramayana, Bala Kanda"
      }
    ],
    Hindi: [
      {
        title: "भगवान कृष्ण की ज्ञान",
        story: "जब अर्जुन कुरुक्षेत्र के रणभूमि पर संशय और भ्रम से भरे हुए थे, तब भगवान कृष्ण ने उन्हें भगवद गीता का दिव्य ज्ञान दिया। इसी तरह, आपकी स्थिति में, याद रखें कि स्पष्टता परिणामों से असंलग्न निष्काम कर्म से आती है। जो सही है उस पर ध्यान केंद्रित करें, और परिणामों के बारे में चिंता को छोड़ दें।",
        reference: "भगवद गीता, अध्याय 2, श्लोक 47"
      },
      {
        title: "प्रह्लाद की भक्ति",
        story: "छोटे प्रह्लाद को अपने पिता हिरण्यकशिपु के कारण भारी पीड़ा हुई, फिर भी वह भगवान विष्णु के प्रति अडिग भक्ति बनाए रखते थे। उनकी अटूट आस्था ने उन्हें सभी नुकसान से बचाया। आपकी संघर्ष में, विश्वास और दृढ़ता के माध्यम से आंतरिक शक्ति का विकास करें, यह जानते हुए कि दिव्य संरक्षण उन लोगों को घेरे रहता है जो अपने पथ पर सच्चे रहते हैं।",
        reference: "श्रीमद भागवतम, कांड 7"
      },
      {
        title: "भगवान राम का धैर्य",
        story: "भगवान राम ने चौदह साल के वनवास को अपने राज्य और प्रियजनों से दूर बिना शिकायत के सहा। उनका धैर्य और धर्म का पालन हमें सिखाता है कि सच्ची शक्ति विनम्रता के साथ कठिनाइयों को सहने में है। आपकी वर्तमान स्थिति में, धैर्य का अभ्यास करें और घटनाओं के दिव्य समय पर भरोसा करें।",
        reference: "वाल्मीकि रामायण, अयोध्या कांड"
      },
      {
        title: "भगवान हनुमान की विनम्रता",
        story: "भगवान हनुमान, अपनी विपुल शक्तियों के बावजूद, हमेशा भगवान राम के एक विनम्र सेवक के रूप में मानते थे। उनका अहंकार रहित भक्ति हमें सिखाती है कि सच्ची शक्ति विनम्रता में है। आपकी चुनौतियों में, विनम्रता और सेवा के साथ आगे बढ़ें, और आपको वह शक्ति मिलेगी जिसका आपको पता तक नहीं था।",
        reference: "तुलसीदास रामचरितमानस, सुंदर कांड"
      },
      {
        title: "भगवान शिव की क्षमा",
        story: "जब कामदेव ने भगवान शिव के ध्यान को बाधित किया, तो शिव ने अपनी तीसरी आंख से उसे भस्म कर दिया। लेकिन जब कामदेव की पत्नी ने प्रार्थना की, तो शिव ने क्षमा की और उसे पुनर्स्थापित कर दिया। यह हमें सिखाता है कि क्षमा एक दिव्य गुण है जो शांति लाता है। उन लोगों को क्षमा करें जिन्होंने आपके साथ गलत किया है, और अंदर शांति पाएं।",
        reference: "शिव पुराण, रुद्र संहिता"
      },
      {
        title: "राजा बलि का त्याग",
        story: "राजा बलि को, भगवान विष्णु द्वारा दिए गए वर के बावजूद, जब विष्णु वामन के रूप में प्रकट हुए तो उन्होंने पूर्ण आत्मसमर्पण दिखाया। उनका अपने राज्य और अहंकार से त्याग हमें सिखाता है कि सच्ची संपत्ति छोड़ने में है। परिणामों से त्याग का अभ्यास करें, और आपको सच्ची संतुष्टि मिलेगी।",
        reference: "श्रीमद भागवतम, कांड 8"
      },
      {
        title: "माता सरस्वती का ज्ञान",
        story: "माता सरस्वती, ज्ञान की देवी, हमें सिखाती हैं कि सच्चा ज्ञान आंतरिक चिंतन से आता है, न कि सिर्फ किताबों से। आपकी स्थिति में, बाहरी स्रोतों से ही नहीं, बल्कि अपने आंतरिक स्वयं से ज्ञान खोजें। ध्यान करें और प्रतिबिंबित करें ताकि आंतरिक उत्तर मिल सकें।",
        reference: "देवी माहात्म्य, मार्कंडेय पुराण"
      },
      {
        title: "भगवान बुद्ध की करुणा",
        story: "भगवान बुद्ध ने बोध की खोज के लिए अपने महल को छोड़ दिया और अपने जीवन को दुःख से मुक्ति के मार्ग को सिखाने में बिताया। उनकी सभी प्राणियों, पशुओं सहित, के प्रति करुणा हमें सहानुभूति की शक्ति सिखाती है। आपके संघर्ष में, दूसरों और खुद के प्रति करुणा बढ़ाएं, और दुःख कम हो जाएगा।",
        reference: "धम्मपद, श्लोक 5"
      },
      {
        title: "द्रौपदी की शक्ति",
        story: "द्रौपदी, न्यायालय में अपने वस्त्र छीने जाने के बावजूद, भगवान कृष्ण को पुकारती हैं जिन्होंने उन्हें दिव्य कृपा से बचाया। धर्म और दिव्य में अडिग विश्वास उन्हें सभी नुकसान से बचाता है। हमें सिखाता है कि हमारे सबसे अंधेरे के पल में, विश्वास हमारा सबसे बड़ा संरक्षक हो सकता है। आपकी आवश्यकता के समय दिव्य को पुकारें।",
        reference: "महाभारत, वन पर्व"
      },
      {
        title: "महर्षि वाल्मीकि की संतुष्टि",
        story: "महर्षि वाल्मीकि एक डाकू से एक पूजनीय महर्षि में ध्यान और भक्ति के माध्यम से रूपांतरित हुए। उनकी सरल वन जीवन में संतुष्टि हमें सिखाती है कि खुशी बाहरी परिस्थितियों पर निर्भर नहीं है। सरलता में संतुष्टि पाएं, और आपको सच्ची खुशी मिलेगी।",
        reference: "वाल्मीकि रामायण, बाल कांड"
      }
    ],
    Telugu: [
      {
        title: "భగవంతుని జ్ఞానం",
        story: "కురుక్షేత్ర యుద్ధభూమిలో అర్జునుడు సందేహం ఇబ్బంది తో నిండి ఉన్నప్పుడు, భగవంతుడు కృష్ణుడు అతనికి భగవద్గీత యొక్క దివ్య జ్ఞానాన్ని ఇచ్చాడు. అదే విధంగా, మీ పరిస్థితిలో, ఫలితాలకు అనుబంధం లేకుండా నిష్కామ కర్మ ద్వారా స్పష్టత వస్తుందని గుర్తుంచుకోండి. సరైనదానిపై దృష్టి పెట్టండి మరియు ఫలితాల గురించిన ఆందోళనను వదిలేయండి.",
        reference: "భగవద్గీత, అధ్యాయం 2, శ్లోకం 47"
      },
      {
        title: "ప్రహ్లాదుని భక్తి",
        story: "చిన్న ప్రహ్లాదునికి తన తండ్రి హిరణ్యకశిపు వల్ల భారీ అణచివేత జరిగింది, అయినప్పటికీ అతను భగవంతుని విష్ణువుకు అడిగిన భక్తిని కాపాడుకున్నాడు. అతని అటుటి విశ్వాసం అతన్ని అన్ని హాని నుండి రక్షించింది. మీ సోమరిలో, విశ్వాసం మరియు ఉద్దీపన ద్వారా అంతర్గత శక్తిని పెంపొందించండి, వారి మార్గంలో నిజమైనవారికి దివ్య రక్షణ ఉందని తెలుసుకోండి.",
        reference: "శ్రీమద్భాగవతం, కాండం 7"
      },
      {
        title: "భగవంతుని రాముని ధైర్యం",
        story: "భగవంతుడు రాముడు తన రాజ్యం మరియు ప్రియులు నుండి దూరంగా ఉన్న 14 సంవత్సరాల వనవాసాన్ని అభ్యంతరం లేకుండా సహించాడు. అతని ధైర్యం మరియు ధర్మాన్ని పాటించడం మనకు నేర్పిస్తుంది కష్టాలను వినయంతో సహించడంలో నిజమైన బలం ఉందని. మీ ప్రస్తుత పరిస్థితిలో, ధైర్యాన్ని అభ్యసించండి మరియు సంఘటనల దివ్య సమయానికి నమ్మకం ఉంచండి.",
        reference: "వాల్మీకి రామాయణం, అయోధ్యా కాండం"
      },
      {
        title: "భగవంతుని హనుమంతు వినయం",
        story: "భగవంతుడు హనుమంతు, తన విపులమైన శక్తులకు దృష్టి పెట్టకుండా, ఎల్లప్పుడూ భగవంతుని రాముని వినమ్రుడైన సేవకునిగా పరిగణిస్తాడు. అతని అహంకారం లేని భక్తి మనకు నేర్పిస్తుంది నిజమైన శక్తి వినయంలో ఉంటుందని. మీ సవాళ్లలో, వినయం మరియు సేవ ద్వారా ముందుకు సాగండి, మరియు మీకు మీరు తెలీకుండా ఉన్న శక్తిని కనుగొంటారు.",
        reference: "తులసీదాస్ రామచరితమానస్, సుందర కాండం"
      },
      {
        title: "భగవంతుని శివుని క్షమాభావం",
        story: "కామదేవుడు భగవంతుని శివుని ధ్యానాన్ని అంతరాయపరిచినప్పుడు, శివుడు తన మూడవ కన్నుతో అతనిని భస్మం చేశాడు. అయితే, కామదేవుని భార్య వేడుకున్నప్పుడు, శివుడు క్షమించాడు మరియు అతనిని పునరుద్ధరించాడు. ఇది మనకు క్షమాభావం దివ్య గుణం అని మరియు శాంతిని తీసుకురావడాన్ని నేర్పిస్తుంది. మీకు అపకారం చేసిన వారిని క్షమించండి మరియు లోపల శాంతిని పొందండి.",
        reference: "శివ పురాణం, రుద్ర సంహిత"
      },
      {
        title: "రాజు బలి విరాగం",
        story: "రాజు బలికి, భగవంతుని విష్ణువు ఇచ్చిన వరం ఉన్నప్పటికీ, విష్ణువు వామనుడిగా కనిపించినప్పుడు అతను పూర్తి సమర్పణను చూపాడు. అతని తన రాజ్యం మరియు అహంకారం నుండి విరాగం మనకు నేర్పిస్తుంది విడుదల లో నిజమైన ధనం ఉంటుందని. ఫలితాల నుండి విడుదల అభ్యాసం చేయండి మరియు మీకు నిజమైన సంతృప్తి లభిస్తుంది.",
        reference: "శ్రీమద్భాగవతం, కాండం 8"
      },
      {
        title: "దేవత సరస్వతి జ్ఞానం",
        story: "దేవత సరస్వతి, జ్ఞాన దేవత, మనకు నేర్పిస్తుంది నిజమైన జ్ఞానం ఆంతరిక ప్రతిఫలనం నుండి వస్తుందని, కేవలం పుస్తకాల నుండి కాదు. మీ పరిస్థితిలో, బాహ్య వర్గాల నుండి మాత్రమే కాకుండా, మీ ఆంతరిక స్వయం నుండి జ్ఞానాన్ని అన్వేషించండి. ధ్యానం చేయండి మరియు ప్రతిఫలనం చేయండి తాకి లోపలి సమాధానాలు కనుగొనండి.",
        reference: "దేవి మాహాత్మ్య, మార్కండేయ పురాణం"
      },
      {
        title: "భగవంతుని బుద్ధుని కరుణ",
        story: "భగవంతుడు బుద్ధుడు బోధ కోసం తన మహలాన్ని వదిలి బోధ నుండి ముక్తి మార్గాన్ని నేర్పడంలో తన జీవితాన్ని గడపాడు. జంతువులతో పాటు అన్ని ప్రాణులకు అతని కరుణ మనకు సహానుభూతి శక్తిని నేర్పిస్తుంది. మీ సోమరిలో, ఇతరులకు మరియు మీకు కరుణ పెంపొందించండి మరియు బాధ తగ్గుతుంది.",
        reference: "ధమ్మపద, శ్లోకం 5"
      },
      {
        title: "ద్రౌపది శక్తి",
        story: "ద్రౌపది, న్యాయాలయంలో తన వస్త్రం అపహరింపబడినప్పటికీ, భగవంతుని కృష్ణుని పిలిచింది ఇతను దివ్య కృపతో ఆమెను కాపాడాడు. ధర్మం మరియు దివ్యంలో అడిగిన విశ్వాసం అంతా నుకసాన్నుండి ఆమెను కాపాడింది. మనకు నేర్పిస్తుంది మన చీకటి క్షణాలలో, విశ్వాసం మన గరిష్ఠ సంరక్షకుడిగా ఉండవచ్చు. మీ అవసరం ఉన్నప్పుడు దివ్యుని పిలుచుకోండి.",
        reference: "మహాభారతం, వన పర్వం"
      },
      {
        title: "మహర్షి వాల్మీకి సంతృప్తి",
        story: "మహర్షి వాల్మీకి ధ్యానం మరియు భక్తి ద్వారా దస్తా నుండి పూజనీయ మహర్షిగా మారాడు. అతని సరళమైన అడవి జీవితంలో సంతృప్తి మనకు నేర్పిస్తుంది సంతోషం బాహ్య పరిస్థితులపై ఆధారపడదు. సరళత్వంలో సంతృప్తిని పొందండి మరియు మీకు నిజమైన సంతోషం లభిస్తుంది.",
        reference: "వాల్మీకి రామాయణం, బాల కాండం"
      }
    ]
  };
  
  return mockSolutions[language] || mockSolutions.English;
}