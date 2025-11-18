import { ExponentialCost, FreeCost, FirstFreeCost } from "./api/Costs";
import { Localization                             } from "./api/Localization";
import { BigNumber, parseBigNumber                                } from "./api/BigNumber";
import { theory, QuaternaryEntry                  } from "./api/Theory";
import { Utils                                    } from "./api/Utils";

var id          = "amalgamation_of_ideas_new";
var name        = "Amalgamation of Ideas";
var description = "A bug fixed version of Amalgamation of Ideas. The old one (for mid-seasons) can be found here:\n\nhttps://raw.githubusercontent.com/Altimary/exp-idle/refs/heads/main/amalgamation_of_ideas.js";
var authors     = "Altimary";
var version     = 2;

var currency, currency_N, currency_I, currency_T, currency_P;
var  c1, c2 ,     n     ,     i     ,     t1    ,     p     ;
var perm1, perm2, perm3, perm4, perm5, perm6;
var QuaternaryEntries;

var tauMultiplier = 0.2;

var t       = BigNumber.ZERO;
var sqrtT   = BigNumber.ZERO;
var highest = BigNumber.ZERO;

let e3   = BigNumber.from(3   * tauMultiplier);
let e20  = BigNumber.from(20  * tauMultiplier);
let e40  = BigNumber.from(40  * tauMultiplier);
let e50  = BigNumber.from(50  * tauMultiplier);
let e60  = BigNumber.from(60  * tauMultiplier);
let e75  = BigNumber.from(75  * tauMultiplier);
let e110 = BigNumber.from(110 * tauMultiplier);
let e160 = BigNumber.from(160 * tauMultiplier);
let e180 = BigNumber.from(180 * tauMultiplier);
let e200 = BigNumber.from(200 * tauMultiplier);
let e308 = BigNumber.from(Math.log10(1.796e308) * tauMultiplier); // Low-balling to prevent weird floating point phenomena
let e365 = BigNumber.from(365 * tauMultiplier);
let e750 = BigNumber.from(750 * tauMultiplier);

var init = () => {
    // Initiate currencies
    currency   = theory.createCurrency();
    currency_N = theory.createCurrency('N', 'N');
    currency_I = theory.createCurrency('I', 'I');
    currency_T = theory.createCurrency('T', 'T');
    currency_P = theory.createCurrency('P', 'P');

    sqrtT = BigNumber.from(Math.sqrt(t));
    QuaternaryEntries = [];

    ///////////////////
    // Regular Upgrades

    // c1
    {
        let getDesc = (level) => "c_1=" + getC1(level).toString(0);
        c1 = theory.createUpgrade(0, currency, new FirstFreeCost(new ExponentialCost(15, Math.log2(2))));
        c1.getDescription = (_) => Utils.getMath(getDesc(c1.level));
        c1.getInfo = (amount) => Utils.getMathTo(getDesc(c1.level), getDesc(c1.level + amount));
    }

    // c2
    {
        let getDesc = (level) => "c_2=2^{" + level + "}";
        let getInfo = (level) => "c_2=" + getC2(level).toString(0);
        c2 = theory.createUpgrade(1, currency, new ExponentialCost(5, Math.log2(10)));
        c2.getDescription = (_) => Utils.getMath(getDesc(c2.level));
        c2.getInfo = (amount) => Utils.getMathTo(getInfo(c2.level), getInfo(c2.level + amount));
    }

    // n
    {
        let getDesc = (level) => "n=5^{" + level + "}";
        let getInfo = (level) => "n=" + getN(level).toString(0);
        n = theory.createUpgrade(2, currency_N, new ExponentialCost(5, Math.log2(5)));
        n.getDescription = (_) => Utils.getMath(getDesc(n.level));
        n.getInfo = (amount) => Utils.getMathTo(getInfo(n.level), getInfo(n.level + amount));
        n.isAvailable = false;
    }

    // i
    {
        let getDesc = (level) => "i=10^{" + level + "}";
        let getInfo = (level) => "i=" + getI(level).toString(0);
        i = theory.createUpgrade(3, currency_I, new ExponentialCost(10, Math.log2(3)));
        i.getDescription = (_) => Utils.getMath(getDesc(i.level));
        i.getInfo = (amount) => Utils.getMathTo(getInfo(i.level), getInfo(i.level + amount));
        i.isAvailable = false;
    }

    // t_1
    {
        let getDesc = (level) => "t_1=10^{" + level + "}";
        let getInfo = (level) => "t_1=" + getT(level).toString(0);
        t1 = theory.createUpgrade(4, currency_T, new ExponentialCost(10, Math.log2(5)));
        t1.getDescription = (_) => Utils.getMath(getDesc(t1.level));
        t1.getInfo = (amount) => Utils.getMathTo(getInfo(t1.level), getInfo(t1.level + amount));
        t1.isAvailable = false;
    }

    // exp
    {
        let getDesc = (level) => "exp=" + getExp(level).toString(4);
        let getInfo = (level) => "exp=" + getExp(level).toString(4);
        exp = theory.createUpgrade(5, currency, new FreeCost());
        exp.getDescription = (_) => Utils.getMath(getDesc(exp.level));
        exp.getInfo = (amount) => Utils.getMathTo(getInfo(exp.level), getInfo(exp.level + amount));
        exp.maxLevel = 1000;
        exp.isAvailable = false;
    }

    // p
    {
        let getDesc = (level) => "p=10^{" + GetPLevel(level).toString(2) + "}";
        let getInfo = (level) => "p=" + getP(level).toString(0);
        p = theory.createUpgrade(6, currency_P, new ExponentialCost(10, Math.log2(5)));
        p.getDescription = (_) => Utils.getMath(getDesc(p.level));
        p.getInfo = (amount) => Utils.getMathTo(getInfo(p.level), getInfo(p.level + amount));
        p.maxLevel = 100;
        p.isAvailable = false;
    }

    /////////////////////
    // Permanent Upgrades
    theory.createPublicationUpgrade(0, currency, 1e3);
    theory.createBuyAllUpgrade     (1, currency, 1e10);
    theory.createAutoBuyerUpgrade  (2, currency, 1e25);

    {
        perm1 = theory.createPermanentUpgrade(3, currency_T, new CustomCost(level => BigNumber.from(2.5e5)));
        perm1.description = "Unlock a time-related milestone";
        perm1.info = "Unlock a time-related milestone";
        perm1.boughtOrRefunded = (_) => {updateAvailability(); };
        perm1.maxLevel = 1;
        perm1.isAvailable = false;
    }

    {
        perm2 = theory.createPermanentUpgrade(4, currency_N, new CustomCost(level => BigNumber.from(5e5)));
        perm2.description = "Unlock an exponent-related milestone";
        perm2.info = "Unlock an exponent-related milestone";
        perm2.boughtOrRefunded = (_) => {updateAvailability(); };
        perm2.maxLevel = 1;
        perm2.isAvailable = false;
    }

    {
        perm3 = theory.createPermanentUpgrade(5, currency_I, new CustomCost(level => BigNumber.TEN.pow(6)));
        perm3.description = "Unlock an formula-related milestone";
        perm3.info = "Unlock an formula-related milestone";
        perm3.boughtOrRefunded = (_) => {updateAvailability(); };
        perm3.maxLevel = 1;
        perm3.isAvailable = false;
    }

    {
        perm4 = theory.createPermanentUpgrade(6, currency_P, new ExponentialCost(10, Math.log2(1.125)));
        perm4.getDescription = (level) => "P-replicating chance: " + BigNumber.from(perm4.level/10 + 1) + "\\%";
        perm4.info = "Increase P-replicating chance by 1\\%";
        perm4.boughtOrRefunded = (_) => {updateAvailability(); };
        perm4.maxLevel = 990;
        perm4.isAvailable = false;
    }

    {
        let getInfo = (level) => "\\log_{" + (10 - level * 0.5) + "}(x)";
        perm5 = theory.createPermanentUpgrade(7, currency, new ExponentialCost(BigNumber.TEN.pow(400), Math.log2(1e125)));
        perm5.description = "Accelerator's formula scale better";
        perm5.getInfo = (amount) => (perm5.level + amount <= 10) ? "Current: " + Utils.getMathTo(getInfo(perm5.level), getInfo(perm5.level + amount)) : "Current: $\\log_{5}(x)$";
        perm5.boughtOrRefunded = (_) => {updateAvailability(); };
        perm5.maxLevel = 10;
        perm5.isAvailable = false;
    }

    {
        perm6 = theory.createPermanentUpgrade(8, currency_P, new ExponentialCost(BigNumber.from(1e95), Math.log2(5e16)));
        perm6.description = "Improve p upgrade";
        perm6.info = "Improve p's max level and decay formula"
        perm6.boughtOrRefunded = (_) => {updateAvailability(); };
        perm6.isAvailable = false;
    }

    ///////////////////////
    //// Milestone Upgrades
    theory.setMilestoneCost(milestoneCost);

    {
        dimension = theory.createMilestoneUpgrade(0, 2);
        dimension.getDescription = () => dimension.level == 0 ? "Getting slow?" : "Wasn't Enought?";
        dimension.getInfo = () => dimension.level == 0 ? "Create a new currency..." : 'Create another currency...';
        dimension.boughtOrRefunded = (_) => {theory.invalidatePrimaryEquation(); updateAvailability(); };
        dimension.canBeRefunded = (_) => breakInfinity.level == 0;
    }

    {
        timeDimension = theory.createMilestoneUpgrade(1, 2);
        timeDimension.getDescription = () => timeDimension.level == 0 ? "Wasting time?" : (perm1.level == 0 ? "Wasting time?" : "Time also affect f(x) at a reduced rate.");
        timeDimension.getInfo = () => timeDimension.level == 0 ? "Create yet another currency..." : (perm1.level == 0 ? "Create yet another currency..." : "Multiply base function by $\\sqrt{t}$");
        timeDimension.boughtOrRefunded = (_) => {theory.invalidatePrimaryEquation(); updateAvailability(); };
        timeDimension.canBeRefunded = (_) => breakInfinity.level == 0;
        timeDimension.isAvailable = false;
    }

    {
        filler1 = theory.createMilestoneUpgrade(2, 1);
        filler1.description = "Small improvement.";
        filler1.info = "Multiply everything by $e^e$";
        filler1.boughtOrRefunded = (_) => {theory.invalidatePrimaryEquation(); updateAvailability(); };
        filler1.canBeRefunded = (_) => breakInfinity.level == 0;
        filler1.isAvailable = false;
    }

    {
        clicker = theory.createMilestoneUpgrade(3, 3);
        clicker.getDescription = () => clicker.level == 0 ? Localization.getUpgradeIncCustomExpDesc("f(x)", "0.1") : (perm2.level == 0 ? Localization.getUpgradeIncCustomExpDesc("f(x)", "0.1") : "Improve clicker.");
        clicker.info = "Increases f(x) exponent by 0.1 with a twist...";
        clicker.boughtOrRefunded = (_) => {theory.invalidatePrimaryEquation(); updateAvailability(); };
        clicker.canBeRefunded = (_) => breakInfinity.level == 0 || clicker.level > 2;
        clicker.isAvailable = false;
    }

    {
        improve = theory.createMilestoneUpgrade(4, 2);
        improve.getDescription = () => improve.level == 0 ? "Work it harder, make it better." : (perm3.level == 0 ? "Work it harder, make it better." : "Do it faster, makes us stronger.");
        improve.getInfo = () => improve.level == 0 ? "Improve g(x)" : (perm3.level == 0 ? "Improve g(x)" : "Improve h(x)");
        improve.boughtOrRefunded = (_) => {theory.invalidatePrimaryEquation(); updateAvailability(); };
        improve.canBeRefunded = (_) => breakInfinity.level == 0;
        improve.isAvailable = false;
    }

    {
        replicanti = theory.createMilestoneUpgrade(5, 1);
        replicanti.description = "Let's go gambling!";
        replicanti.info = "New... Currency?";
        replicanti.boughtOrRefunded = (_) => {theory.invalidatePrimaryEquation(); updateAvailability(); };
        replicanti.canBeRefunded = (_) => breakInfinity.level == 0;
        replicanti.isAvailable = false;
    }

    {
        breakInfinity = theory.createMilestoneUpgrade(6, 1);
        breakInfinity.description = "To infinity!";
        breakInfinity.info = "Go Infinite.";
        breakInfinity.boughtOrRefunded = (_) => {theory.invalidatePrimaryEquation(); updateAvailability(); };
        breakInfinity.canBeRefunded = (_) => accelerator.level == 0;
        breakInfinity.isAvailable = false;
    }

    {
        accelerator = theory.createMilestoneUpgrade(7, 1);
        accelerator.description = "Initiate the Accelerator.";
        accelerator.info = "Using wizardry to speed up the game";
        accelerator.boughtOrRefunded = (_) => {theory.invalidatePrimaryEquation(); updateAvailability(); };
        accelerator.isAvailable = false;
    }
    
    /////////////////
    //// Achievements
    let achievement_category1 = theory.createAchievementCategory(0, "Currencies");
    // Rho
    theory.createAchievement(0,  achievement_category1, "Astronomical Unit", "Reach 1.496e11ρ."        , () => currency.value > BigNumber.from(1.495978707e11));
    theory.createAchievement(1,  achievement_category1, "Megaparsec", "Reach 3.086e22ρ."               , () => currency.value > BigNumber.from(3.0857e22));
    theory.createAchievement(2,  achievement_category1, "Planck Temperature", "Reach 1.417e32ρ."       , () => currency.value > BigNumber.from(1.41678416e32));
    theory.createAchievement(3,  achievement_category1, "Cosmological Constant^(-1)", "Reach 9.18e51ρ.", () => currency.value > BigNumber.from(9.1802496e51));
    theory.createAchievement(4,  achievement_category1, "Pritaelus 104", "Reach 1e104ρ."               , () => currency.value > BigNumber.from(1e104));
    theory.createAchievement(5,  achievement_category1, "A Quarter to Two", "Reach 1e175ρ."            , () => currency.value > BigNumber.from(1e175));
    theory.createAchievement(6,  achievement_category1, "Middle C", "Reach 4.22e261ρ (10^261.625)."    , () => currency.value > BigNumber.TEN.pow(261.625565)); // I found this one quite funny
    theory.createAchievement(7,  achievement_category1, "Infinity", "Reach 1.79e308ρ."                 , () => currency.value > BigNumber.TWO.pow(1024));
    theory.createAchievement(8,  achievement_category1, "Fahrenheit 451", "Reach 1e451ρ."              , () => currency.value > BigNumber.TEN.pow(451));
    theory.createAchievement(9,  achievement_category1, "Jackpot!", "Reach 7.77e777ρ."                 , () => currency.value > BigNumber.TEN.pow(777) * 7.77);
    theory.createAchievement(10, achievement_category1, "One Thousand and One Nights", "Reach 1e1001ρ.", () => currency.value > BigNumber.TEN.pow(1001));
    theory.createAchievement(11, achievement_category1, "Ashen Light", "Reach 1e1638ρ."                , () => currency.value > BigNumber.TEN.pow(1638)); // "Bygone Visions of Cosmic Neighbors" by LEMMiNO
    theory.createAchievement(12, achievement_category1, "A New Millennia", "Reach 1e2000ρ."            , () => currency.value > BigNumber.TEN.pow(2000)); // Could have choosen my birth year of 2006... If you're reading this, now you know
    theory.createAchievement(13, achievement_category1, "Penultimate", "Reach 1e2500ρ."                , () => currency.value > BigNumber.TEN.pow(2500));
    theory.createAchievement(14, achievement_category1, "Millinillion", "Reach 1e3003ρ."               , () => currency.value > BigNumber.TEN.pow(3003));
    // Negative
    theory.createAchievement(15, achievement_category1, "Posthaste", "Reach 2.998e8N.", () => currency_N.value > BigNumber.from(299792458));
    theory.createAchievement(16, achievement_category1, "VX", "Reach 1e15N."          , () => currency_N.value > BigNumber.from(1e15)); // A neurotoxin, written in reverse as XV, the Roman numeral
    theory.createAchievement(17, achievement_category1, "TON 618", "Reach 6e18N."     , () => currency_N.value > BigNumber.from(6e18)); // A reference to the black hole, not Geometry Dash (I don't even know that level)
    // Imaginary
    theory.createAchievement(18, achievement_category1, "Orirock", "Reach 1e7I."           , () => currency_I.value > BigNumber.from(1e7)); // 1-7 Orirock farm forever!
    theory.createAchievement(19, achievement_category1, "B.B.K.K.B.K.K", "Reach 2.0e13I."  , () => currency_I.value > BigNumber.from(2e13)); // From BOF 2013
    theory.createAchievement(20, achievement_category1, "Misplaced in Time", "Reach 1e19I.", () => currency_I.value > BigNumber.from(1e19)); // Tier 19
    // Time
    theory.createAchievement(21, achievement_category1, "Wish Upon the Pleiades", "Reach 4e5T.", () => currency_T.value > BigNumber.from(4e5)); // Pleiades, aka Messier 45
    theory.createAchievement(22, achievement_category1, "NILNAL", "Reach 1.92e9T."             , () => currency_T.value > BigNumber.from(1.92e9)); // REx: Reincarnated
    theory.createAchievement(23, achievement_category1, "Umhüllt von Leiden", "Reach 1e23T."   , () => currency_T.value > BigNumber.from(1e23)); // Tier 23
    // Probability
    theory.createAchievement(24, achievement_category1, "Mikopi", "Reach 35P."                , () => currency_P.value > BigNumber.from(35)); // I'm more of a Koronesuki and Pioneer, but this makes a great reference
    theory.createAchievement(25, achievement_category1, "Candela", "Reach 5.4e14P."           , () => currency_P.value > BigNumber.from(5.4e14)); // #78ff00's monochromatic radiation frequency. Nobody like candela also
    theory.createAchievement(26, achievement_category1, "Avocado Constant", "Reach 6.02e23P." , () => currency_P.value > BigNumber.from(6.02214076e23)); // Avogadro...
    theory.createAchievement(27, achievement_category1, "Kryptos", "Reach 8e69P."             , () => currency_P.value > BigNumber.from(8e69)); // There are 869 letters in Kryptos
    theory.createAchievement(28, achievement_category1, "A Googol", "Reach 1e100P."           , () => currency_P.value > BigNumber.from(1e100));
    theory.createAchievement(29, achievement_category1, "Territorial Tendency", "Reach 1e150.", () => currency_P.value > BigNumber.from(1e150)); // Another Arknights ref. The number; however, is unrelated.
    
    let achievement_category2 = theory.createAchievementCategory(1, "Milestone");
    theory.createAchievement(30, achievement_category2, "Back-tracking", "Unlock negative milestone."               , () => dimension    .level > 0);
    theory.createAchievement(31, achievement_category2, "New Axis", "Unlock imaginary milestone."                   , () => dimension    .level > 1);
    theory.createAchievement(32, achievement_category2, "Parsley, Sage, Rosemary and Time", "Unlock time milestone.", () => timeDimension.level > 0);
    theory.createAchievement(33, achievement_category2, "Cookie Clicker", "Unlock exponent milestone."              , () => clicker      .level > 0);
    theory.createAchievement(34, achievement_category2, "REPLICANTI???", "Unlock probability milestone."            , () => replicanti   .level > 0);
    theory.createAchievement(35, achievement_category2, "Era of Automation", "Unlock a certain milestone."          , () => breakInfinity.level > 0);
    theory.createAchievement(36, achievement_category2, "Gravity Assist", "Unlock acceleration milestone."          , () => accelerator  .level > 0);
    theory.createAchievement(37, achievement_category2, "Exp is Golden", "Unlock the final exponent milestone."     , () => clicker      .level > 2); // My favourite light novel
    theory.createAchievement(38, achievement_category2, "This Mile Took an Eternity", "Reach all milestones."       , () => (theory.milestonesTotal > 12 && theory.milestonesUnused < 1)); // Eternity Milestones (AD)
    
    let achievement_category3 = theory.createAchievementCategory(2, "Time");
    // Time in publication
    theory.createAchievement(39, achievement_category3, "Parity of Singularity", "Spend 100 days (game time) in this publication."               , () => t > BigNumber.from(8640000));
    theory.createAchievement(40, achievement_category3, "Interstellar", "Spend 1.608e9 second (game time) in this publication."                  , () => t > BigNumber.from(1608336000));
    theory.createAchievement(41, achievement_category3, "Six Trillions Seconds and a Night", "Spend 1e12 second (game time) in this publication.", () => t > BigNumber.from(1e12)); // True six trillions year and a night would be impossible without making the game unbalanced
    theory.createAchievement(42, achievement_category3, "The Past is a Foreign Country", "Spend 1e15 second (game time) in this publication."    , () => t > BigNumber.from(1e15)); // Revisited
    // Time per second
    theory.createAchievement(43, achievement_category3, "A Mile a Second", "Reach 1609t per second."       , () => GetSpeedUp() > BigNumber.from(1609)); // A Mile a Minute
    theory.createAchievement(44, achievement_category3, "5 Kilometers per Second", "Reach 5e5t per second.", () => GetSpeedUp() > BigNumber.from(5e5)); // Parody of 5 Centimeters per Second
    theory.createAchievement(45, achievement_category3, "Time is Relative", "Reach 1e9t per second."       , () => GetSpeedUp() > BigNumber.from(1e9));
    
    let achievement_category4 = theory.createAchievementCategory(3, "Miscellaneous");
    theory.createAchievement(46, achievement_category4, "Timeless Classic", "Get sqrt(t) to 50. It will happen eventually...", () => Math.sqrt(t) >= 50);
    theory.createAchievement(47, achievement_category4, "Extratone", "Have 1000 level of c1 upgrade."                        , () => c1   .level  >= 1000); // BPM = RT
    theory.createAchievement(48, achievement_category4, "Testify", "Have 12 level of t1 upgrade."                            , () => t1   .level  >= 12); // BYD cc12.0 barely even A rank
    theory.createAchievement(49, achievement_category4, "Not Great, Not Terrible", "Reach 3.6% P-replicating chance."        , () => perm4.level  >= 26); // 3.6 roentgen
    theory.createAchievement(50, achievement_category4, "WYSI", "Have 727 level of c2 upgrade."                              , () => c2   .level  >= 727); // Osu! community, summarized
    theory.createAchievement(51, achievement_category4, "Neutral pH", "Reach accelerator's base of 7"                        , () => perm5.level  >= 6);
    theory.createAchievement(52, achievement_category4, "p-addict", "Have 101 level of p upgrade."                           , () => p    .level  >= 101); // p-adic. Quite a nice pun I would say
    theory.createAchievement(53, achievement_category4, "Benzene", "Have 6 level of improve p upgrade."                      , () => perm6.level  >= 6); // Unlike benzene, P are quite unstable

    let achievement_category5 = theory.createAchievementCategory(4, "Secret Achievements");
    theory.createSecretAchievement(54, achievement_category5, "Big Crunch", "A surprise, but a welcome one.", "Wrong game!"   , () => breakInfinity.level > 0);
    theory.createSecretAchievement(55, achievement_category5, "Penniless", "Reach 100I with 0ρ.", "You didn't need it anyway.", () => (currency_I.value > BigNumber.from(100) && currency.value < BigNumber.from(0.01)));
    theory.createSecretAchievement(56, achievement_category5, "While You Were Away... Nothing Happened.", "Reach 900t with 0ρ", "See nothing happen while you were away.", () => (t >= BigNumber.from(900) && currency.value < BigNumber.from(0.01))); // Blatant AD plagiarism
    // Could have done something to hide the hidden achievements' contents and requirements... Maybe not. Too lazy, and this is a joke theory anyway.

    ///////////////////
    //// Story chapters
    chapter1 = theory.createStoryChapter(0, "Negate Negativity", "Modifying the equation allowed you to generate a new currency: Negative currency!\nBut, you cannot work on both equation at the same time.", () => dimension.level > 0);
    chapter2 = theory.createStoryChapter(1, "Product of Imagination", "Thanks to the negative-generating function, you can now modify it for yet another currency: Imaginary currency!\nIt should help you progress a little.", () => dimension.level > 1);
    chapter3 = theory.createStoryChapter(2, "Timely Manner", "Your hard work now gain a new currency passively: Time currency!\nIt should come in handy.", () => timeDimension.level > 0);
    chapter4 = theory.createStoryChapter(3, "Minor Inconvenience", "The somewhat active theory has now more active!\nWell, at least you have something to do while milestone-switching.", () => clicker.level > 0);
    chapter5 = theory.createStoryChapter(4, "Seeing Double", "Both upgrade unlocked allowed for the improvement of another formula. Try to guess which one!", () => improve.level > 1);
    chapter6 = theory.createStoryChapter(5, "Exponential Growth", "A new currency: P (stand for Probability).\nA singular P have an n% chance to duplicate itself per tick.\n\nP is capped at 1.15^(log10(rho))", () => replicanti.level > 0);
    chapter7 = theory.createStoryChapter(6, "To Infinity and Beyond!", "With this, you don't have to theory-swap ever again!\nAll praise the theory's author!", () => breakInfinity.level > 0);
    chapter8 = theory.createStoryChapter(7, "We Need To Go Deeper", "All currency (rho, N, I, T, P, S) now boost gamespeed at a reduced rate using a formula that I won't bother write here.\nJust know that it is something like:\n1.125^(1 + (log10(x))^2).", () => accelerator.level > 0); // Love that game

    updateAvailability();
}

var updateAvailability = () => {
    // This fucking thing...
    var finale = (theory.milestonesTotal > 11) ? 1 : 0;

    // Variables unlock
    n  .isAvailable = theory.milestonesTotal > 0;
    i  .isAvailable = theory.milestonesTotal > 1;
    t1 .isAvailable = timeDimension.level    > 0;
    exp.isAvailable = clicker      .level    > 0;
    p  .isAvailable = replicanti   .level    > 0;

    // Permanent upgrades unlock
    perm1.isAvailable = theory.milestonesTotal > 4;
    perm2.isAvailable = theory.milestonesTotal > 6;
    perm3.isAvailable = theory.milestonesTotal > 8;
    perm4.isAvailable = replicanti .level      > 0;
    perm5.isAvailable = accelerator.level      > 0;
    perm6.isAvailable = perm5      .level == perm5.maxLevel

    // Milestones' max level improve
    timeDimension.maxLevel =  1  + perm1.level;
    clicker      .maxLevel =  1  + perm2.level + finale; 
    improve      .maxLevel =  1  + perm3.level;

    // Milestone visibility unlock
    timeDimension.isAvailable = theory.milestonesTotal > 2;
    filler1      .isAvailable = theory.milestonesTotal > 3;
    clicker      .isAvailable = theory.milestonesTotal > 5;
    improve      .isAvailable = theory.milestonesTotal > 7;
    replicanti   .isAvailable = theory.milestonesTotal > 9;
    breakInfinity.isAvailable = highest >= e308 && dimension.level > 1 && filler1.level > 0 && clicker.level > 0 && timeDimension.level > 1 && improve.level > 0 && replicanti.level > 0;
    accelerator  .isAvailable = theory.milestonesTotal > 11;

    setInternalState();
}

var getInternalState = () => `${t}`;

var setInternalState = (state) => {
    if (state) {
        let value = state.split(" ");
        t = parseBigNumber(value[0]);
    };
    p.maxLevel = 100 + perm6.level * 5;
};

const milestoneCost = new CustomCost((level) => {
    if (level == 0 ) return e3  ; //    N    unlock
    if (level == 1 ) return e20 ; //    I    unlock
    if (level == 2 ) return e40 ; //    T    unlock
    if (level == 3 ) return e50 ; //  filler unlock
    if (level == 4 ) return e60 ; //    T    extra
    if (level == 5 ) return e75 ; //   exp   unlock
    if (level == 6 ) return e110; //   exp   extra
    if (level == 7 ) return e160; // improve unlock
    if (level == 8 ) return e180; // improve extra
    if (level == 9 ) return e200; //  repli  unlock
    if (level == 10) return e308; //   inf   break
    if (level == 11) return e365; //  accel  unlock (and exp extra)
    if (level == 12) return e750; //
    return BigNumber.from(-1);
});

var postPublish = () => {
    // Force update all equations
    theory.invalidatePrimaryEquation  (); 
    theory.invalidateSecondaryEquation();
    theory.invalidateQuaternaryValues ();

    t = BigNumber.ZERO;
    currency_P.value = BigNumber.ONE;
};

var tick = (elapsedTime, multiplier) => {
    let dt    = BigNumber.from(elapsedTime * multiplier);
    let bonus = theory.publicationMultiplier;
    
    // preassign for universal usage
    let vc1   = getC1(c1.level);
    let vc2   = getC2(c2.level);
    let vn    = getN (n .level); // Always available for milestone_swapping
    let vi    = getI (i .level); //
    let vt    = timeDimension.level > 0 ? getT(t1.level)               : 1;
    let ve    = filler1      .level > 0 ? BigNumber.E.pow(BigNumber.E) : 1;
    let vt2   = timeDimension.level > 1 ? Math.sqrt(t)                 : 1;
    let vexp  = clicker      .level > 0 ? (1 + getExp(exp.level))      : 1;
    let vp    = replicanti   .level > 0 ? getP(p.level)                : 1;
    let vs    = GetSpeedUp();

    let base  = (bonus * vc1 * vc2 * vn * vi * vt * ve * vt2 * vp).pow(vexp);

    // Rho
    if (dimension.level == 0 && breakInfinity.level < 1) currency.value += dt * vs * base;

    // Negative currency
    if (dimension.level == 1 && breakInfinity.level < 1) {
        // log_a(1/x) = -log_a(x) (Basic logarithm math)
        if (improve.level < 1) {
            currency_N.value += dt * vs * BigNumber.from(base + 1).log () * ve;
        } else {
            currency_N.value += dt * vs * BigNumber.from(base + 1).log2() * Math.pow(ve, 2);
        };
    };

    // Imaginary currency
    if (dimension.level == 2 && breakInfinity.level < 1) {
        if (improve.level < 2) {
            // sqrt(-x) = sqrt(x)*i
            if (improve.level < 1) {
                currency_I.value += dt * vs * Math.sqrt(BigNumber.from(base + 1).log () * ve) * ve;
            } else {
                currency_I.value += dt * vs * Math.sqrt(BigNumber.from(base + 1).log2() * ve) * ve;
            };
        } else {
            // (-x)^0.75 = -x^0.75/sqrt(2) + (x^0.75/sqrt(2))*i
            // The I currency only take the imaginary part
            currency_I.value += dt * vs * Math.SQRT1_2 * Math.pow((BigNumber.from(base + 1).log2() * Math.pow(ve, 2)), 0.75) * ve;
        };
    };

    // Time currency
    if (timeDimension.level > 0) {
        currency_T.value += dt * vs * Math.sqrt(t) * Math.pow(ve, 1 + 1 * improve.level);
    }

    // Replicanti, or P currency
    if (replicanti.level > 0) {
        // Limiting P at: 1 <= P <= 1.15^log10(rho)
        currency_P.value  = BigNumber.ONE.max(currency_P.value); // lower bound
        currency_P.value += PGain(currency_P.value, 1 + perm4.level/10);
        currency_P.value  = BigNumber.from(currency_P.value).min(BigNumber.from(BigNumber.from(1.15).pow(BigNumber.from(currency.value + 1).log10()))); // upper bound
    } else {
        currency_P.value  = BigNumber.ONE;
    };

    // Break infinity allowed the continuous generation of all currencies without milestone-swapping
    if (breakInfinity.level < 1) {
        // Limiting rho at 2^1024 (infinity) when infinity is not broken... real original :D
        currency.value    = BigNumber.from(currency.value).min(BigNumber.TWO.pow(1024));
    } else {
        // Rho
        currency.value   += dt * vs * base;
        // Negative currency
        currency_N.value += dt * vs * BigNumber.from(base + 1).log2() * Math.pow(ve, 2);
        // Imaginary currency
        currency_I.value += dt * vs * Math.SQRT1_2 * Math.pow((BigNumber.from(base + 1).log2() * Math.pow(ve, 2)), 0.75) * ve;
    };

    // t-related calculation
    t += 1 * dt * vs;
    sqrtT = BigNumber.from(Math.sqrt(t));

    highest = BigNumber.from(currency.value).max(highest);
    theory.invalidatePrimaryEquation();
    theory.invalidateQuaternaryValues();
    updateAvailability();
}

var getPrimaryEquation = () => {
    theory.primaryEquationHeight = 110;
    theory.primaryEquationScale  = 0.8;
    let result = "";

    if (dimension.level < 1) {
        result = "\\dot{\\rho}=";
    } else {
        result = "\\dot{\\rho}=f(x):=";
    };

    if (clicker.level > 0) result += "\\left(";

    result += "c_1c_2"

    if (n            .isAvailable) result += "n";
    if (i            .isAvailable) result += "i";
    if (t1           .isAvailable) result += "t_1";
    if (timeDimension.level > 1  ) result += "\\sqrt{t}";
    if (replicanti   .level > 0  ) result += "p";
    if (clicker      .level > 0  ) result += "\\right)^{1+exp}";

    if (dimension.level > 0) {
        if (improve.level < 1) {
            result += "\\\\\\dot{N}=g(x):=\\ln\\left(\\frac{1}{f(x)+1}\\right)";
        } else {
            result += "\\\\\\dot{N}=g(x):=\\log_2\\left(\\frac{1}{f(x)+1}\\right)";
        };

        if (dimension.level > 1) {
            if (improve.level < 2) {
                result += "\\\\\\dot{I}=h(x):=\\sqrt{g(x)}";
            } else {
                result += "\\\\\\dot{I}=h(x):=g(x)^{0.75}";
            };
        };
    };

    if (timeDimension.level > 0) result += "\\\\\\dot{T}=t(x):=\\sqrt{t}";

    return result;
};

var getSecondaryEquation = () => {
    return theory.latexSymbol + "=\\max\\rho^{0.2}";
};

var getQuaternaryEntries = () => {
    if (theory.milestonesTotal > 0) {
        if (QuaternaryEntries.length == 0) {
            QuaternaryEntries.push(new QuaternaryEntry("t"        , null));
            QuaternaryEntries.push(new QuaternaryEntry("T"        , null));
            QuaternaryEntries.push(new QuaternaryEntry("\\sqrt{t}", null));
            QuaternaryEntries.push(new QuaternaryEntry("P"        , null));
            QuaternaryEntries.push(new QuaternaryEntry("S"        , null));
        };

        QuaternaryEntries[0].value = t               .toString(2);
        QuaternaryEntries[1].value = currency_T.value.toString(2);
        QuaternaryEntries[2].value = sqrtT           .toString(2);
        QuaternaryEntries[3].value = currency_P.value.toString(2);
        QuaternaryEntries[4].value = GetSpeedUp()    .toString(2);
    };

    return QuaternaryEntries;
}; 

// Inspired by Replicanti (Antimatter Dimensions)
function PGain(r, n) {
    // Enough to almost guarantee at least 1 per tick before
    // switching to approximation for fast calculation
    const switchThreshold = 100 / n;
    const growthRate = Math.log(1 + n / 100);

    if (r < switchThreshold * 100) {
        // Discrete simulation (each particle duplicates with n% chance)
        let newParticles = 0;
        for (let i = 0; i < r; i++) {
            if (Math.random() < n / 100) newParticles++;
        }
        return newParticles;
    } else {
        // Continuous approximation for large r
        const newR = r * Math.exp(growthRate);
        return newR - r;
    }
}

var isCurrencyVisible = (index) => index == 0 || (index == 1 && dimension.level > 0) || (index == 2 && dimension.level > 1);
var getPublicationMultiplier = (tau) => tau.pow(1.125);
var getPublicationMultiplierFormula = (symbol) => "{" + symbol + "}^{1.125}";
var getTau = () => currency.value.pow(tauMultiplier);
var get2DGraphValue = () => currency.value.sign * (BigNumber.ONE + currency.value.abs()).log10().toNumber();

var getC1  = (level) => Utils.getStepwisePowerSum(level, 3, 10, 0);
var getC2  = (level) => BigNumber.TWO.pow(level);
var getN   = (level) => BigNumber.FIVE.pow(level);
var getI   = (level) => BigNumber.TEN.pow(level);
var getT   = (level) => BigNumber.TEN.pow(level);
var getExp = (level) => BigNumber.from(level) * Math.max(clicker.level, 1) / 10000;

var getP = (level) => {
    // Diminishing return for P after break infinity, because
    // p-scaling is too powerful, and I want to add more contents
    const k_i = 18;
    if (level < k_i) {
        // Linear level-exponent
        return BigNumber.TEN.pow(level);
    } else {
        // Inspired by Glyph Instability formula from Antimatter Dimensions
        // This function tangent with the linear one, making the transition smoother,
        // if r_i is not too large (or else overflow...)
        const r_i = 100 * (2 ** perm6.level);
        const instabilityLevel = k_i + 0.5 * r_i * (Math.sqrt(1 + 4 * (level - k_i) / r_i) - 1);
        return BigNumber.TEN.pow(instabilityLevel);
    };
};

var GetPLevel = (level) => {
    // Get level for description. Maybe redundant, but whatever...
    const k_i = 18;
    if (level < k_i) {
        return BigNumber(level);
    } else {
        const r_i = 100 * (2 ** perm6.level);
        const instabilityLevel = k_i + 0.5 * r_i * (Math.sqrt(1 + 4 * (level - k_i) / r_i) - 1);
        return BigNumber(instabilityLevel);
    };
};

var GetSpeedUp = () => {
    if (accelerator.level < 1) {
        return 1;
    } else {
        const preLog = 1 + BigNumber.from(currency  .value + 1).log10() *
                           BigNumber.from(currency_N.value + 1).log10() *
                           BigNumber.from(currency_I.value + 1).log10() *
                           BigNumber.from(currency_P.value + 1).log10() *
                           BigNumber.from(currency_T.value + 1).log10();
        // Idk if BigNumber support logarithm with bases other than 10, 2 and e, so I using the change of base formula:
        // log_a(x) = log_c(x) / log_c(a)
        const AExp = 1 + BigNumber.from(preLog).log10() / BigNumber.from(10 - perm5.level * 0.5).log10();
        return BigNumber.from(1.125).pow(BigNumber.from(AExp).square())};
};

init(); //  - BigNumber.from(perm5.level)