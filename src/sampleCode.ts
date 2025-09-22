const sampleCode = `
ORG 100
        
MAIN,   CLA             // AC'yi temizle
        ADD SEED        // Başlangıç değeri yükle
        STA NUM         // NUM'a kaydet
        CLA
        STA ITERATION   // İterasyon sayacını sıfırla
        
OUTER_LOOP, LDA ITERATION   // İterasyon sayısını yükle
        OUT             // Hangi iterasyonda olduğunu göster
        
        // Fibonacci benzeri hesaplama
        CLA
        ADD ONE
        STA FIB1        // FIB1 = 1
        STA FIB2        // FIB2 = 1
        CLA
        STA COUNT       // İç döngü sayacı
        
INNER_LOOP, LDA COUNT       // Sayacı kontrol et
        CMA
        INC
        ADD LIMIT       // LIMIT - COUNT
        SNA             // Eğer COUNT >= LIMIT ise atla
        BUN MATH_OPS    // İç döngüden çık
        
        // Fibonacci hesaplama
        LDA FIB1
        ADD FIB2
        STA TEMP        // TEMP = FIB1 + FIB2
        LDA FIB2
        STA FIB1        // FIB1 = FIB2
        LDA TEMP
        STA FIB2        // FIB2 = TEMP
        
        // Sonucu çıktıya yaz
        LDA FIB2
        OUT
        
        // Sayacı artır
        LDA COUNT
        ADD ONE
        STA COUNT
        BUN INNER_LOOP  // İç döngüye devam
        
MATH_OPS, LDA NUM
        ADD FIB2        // NUM + son fibonacci
        STA NUM
        
        // Modulo benzeri işlem (basitleştirilmiş)
        LDA NUM
        CMA
        INC
        ADD MODULO      // MODULO - NUM
        SNA
        BUN RESET_NUM   // Eğer NUM >= MODULO ise sıfırla
        BUN CONTINUE
        
RESET_NUM, LDA SEED
        STA NUM         // NUM'ı başlangıç değerine döndür
        
CONTINUE, LDA ARRAY_PTR
        STA TEMP_PTR    // Geçici pointer
        LDA NUM
        STA TEMP_PTR, I // Array[ptr] = NUM
        
        // Pointer'ı güncelle
        LDA ARRAY_PTR
        ADD ONE
        STA ARRAY_PTR
        CMA
        INC
        ADD ARRAY_END   // ARRAY_END - ARRAY_PTR
        SNA
        BUN RESET_PTR   // Eğer pointer sona ulaştıysa başa döndür
        BUN ARRAY_SUM
        
RESET_PTR, LDA ARRAY_START
        STA ARRAY_PTR
        
ARRAY_SUM, CLA
        LDA ARRAY_0, I      // Array[0]
        ADD ARRAY_1, I      // Array[1] 
        ADD ARRAY_2, I      // Array[2]
        OUT                 // Toplamı çıktıya yaz
        
        // İterasyon sayacını artır
        LDA ITERATION
        ADD ONE
        STA ITERATION
        
        // Rastgele gecikme simülasyonu
        CLA
        STA DELAY_COUNT
        
DELAY_LOOP, LDA DELAY_COUNT
        ADD ONE
        STA DELAY_COUNT
        CMA
        INC
        ADD DELAY_LIMIT
        SNA
        BUN END_DELAY
        BUN DELAY_LOOP
        
END_DELAY, BUN OUTER_LOOP
        
        // Bu satıra asla ulaşılmayacak
        HLT
        
// Değişkenler ve sabitler
NUM,        DEC 5       // İşlenecek sayı
FIB1,       DEC 0       // Fibonacci 1
FIB2,       DEC 0       // Fibonacci 2
TEMP,       DEC 0       // Geçici değişken
COUNT,      DEC 0       // İç döngü sayacı
ITERATION,  DEC 0       // Dış döngü sayacı
DELAY_COUNT, DEC 0      // Gecikme sayacı
TEMP_PTR,   DEC 0       // Geçici pointer

SEED,       DEC 3       // Başlangıç değeri
ONE,        DEC 1       // Sabit 1
LIMIT,      DEC 8       // İç döngü limiti
MODULO,     DEC 100     // Modulo değeri
DELAY_LIMIT, DEC 50     // Gecikme limiti

ARRAY_START, HEX 200    // Dizi başlangıç adresi
ARRAY_PTR,   HEX 200    // Dizi pointer'ı
ARRAY_END,   HEX 210    // Dizi bitiş adresi
ARRAY_0,     HEX 200    // Array[0] adresi
ARRAY_1,     HEX 201    // Array[1] adresi  
ARRAY_2,     HEX 202    // Array[2] adresi

        ORG 200         // Dizi alanı
        DEC 0           // Array[0]
        DEC 0           // Array[1]
        DEC 0           // Array[2]
        DEC 0           // Array[3]
        DEC 0           // Array[4]
        DEC 0           // Array[5]
        DEC 0           // Array[6]
        DEC 0           // Array[7]
        DEC 0           // Array[8]
        DEC 0           // Array[9]
        DEC 0           // Array[10]
        DEC 0           // Array[11]
        DEC 0           // Array[12]
        DEC 0           // Array[13]
        DEC 0           // Array[14]
        DEC 0           // Array[15]
        
        END
`.trim();

export { sampleCode };

// const assemboler = new Assembler(sampleCode);
// const program = assemboler.assemble();
// console.log(program);
