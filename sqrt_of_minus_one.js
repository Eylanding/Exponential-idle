import { ExponentialCost, FreeCost, LinearCost } from "./api/Costs";
import { Localization } from "./api/Localization";
import { BigNumber } from "./api/BigNumber";
import { theory } from "./api/Theory";
import { Utils } from "./api/Utils";

var id = "sqrt_of_minus_one";
var name = "The square root of -1";
var description = "Work with complex numbers to boost the theory.\nBalance increacing rho1 and 2 to maximise gains\nWIP\nVersion 1.0.1";
var authors = "Eylanding";
var version = 1;

var currencyR, currencyI;
var a1, a2, c1, c2, c3, c4;
var a1Exp, a2Exp
var q;

var achievement1, achievement2, achievement3, achievement4, achievement5, achievement6;
var chapter1, chapter2;

var sellC1Timer = 0;

var rhodotR, rhodotI, dt, bonus;

var init = () => {
    currencyR = theory.createCurrency();
    currencyI = theory.createCurrency();

    ///////////////////
    // Regular Upgrades

    // a1
    {
        let getDesc = (level) => "a_1=" + getA1(level) + "";
        let getInfo = (level) => "a_1=" + getA1(level).toString(0);
        a1 = theory.createUpgrade(0, currencyI, new FirstFreeCost(new ExponentialCost(5, Math.log2(1.26))));
        a1.getDescription = (_) => Utils.getMath(getDesc(a1.level));
        a1.getInfo = (amount) => Utils.getMathTo(getInfo(a1.level), getInfo(a1.level + amount));
        a1.maxLevel = 1000
    }

    // a2
    {
        let getDesc = (level) => "a_2=" + getA2(level) + "";
        let getInfo = (level) => "a_2=" + getA2(level).toString(0);
        a2 = theory.createUpgrade(1, currencyR, new FirstFreeCost(new ExponentialCost(10000000000, Math.log2(1.5))));
        a2.getDescription = (_) => Utils.getMath(getDesc(a2.level));
        a2.getInfo = (amount) => Utils.getMathTo(getInfo(a2.level), getInfo(a2.level + amount));
    }

    // c1
    {
        let getDesc = (level) => "c_1=(-2)^{" + level + "}";
        let getInfo = (level) => "\\sqrt{c_1}=" + getC1(level).pow(0.5).toString(0) + ((level % 2 == 1) ? 'i' : '');
        c1 = theory.createUpgrade(2, currencyR, new ExponentialCost(10, Math.log2(2)));
        c1.getDescription = (_) => Utils.getMath(getDesc(c1.level));
        c1.getInfo = (amount) => Utils.getMathTo(getInfo(c1.level), getInfo(c1.level + amount));
    }

    // c2
    {
        let getDesc = (level) => "c_2=(-2)^{" + level + "}";
        let getInfo = (level) => "\\sqrt{c_2^{2}}=" + getC2(level).toString(0);
        c2 = theory.createUpgrade(3, currencyI, new ExponentialCost(5, Math.log2(3.3)));
        c2.getDescription = (_) => Utils.getMath(getDesc(c2.level));
        c2.getInfo = (amount) => Utils.getMathTo(getInfo(c2.level), getInfo(c2.level + amount));
    }

    // c3
    {
        let getDesc = (level) => "c_3=(-2)^{" + level + "}";
        let getInfo = (level) => "\\sqrt{c_3^{3}}=" + getC3(level).pow(1.5).toString(0) + ((level % 2 == 1) ? 'i' : '');
        c3 = theory.createUpgrade(4, currencyR, new ExponentialCost(5000, Math.log2(7.5)));
        c3.getDescription = (_) => Utils.getMath(getDesc(c3.level));
        c3.getInfo = (amount) => Utils.getMathTo(getInfo(c3.level), getInfo(c3.level + amount));
    }

    // c4
    {
        let getDesc = (level) => "c_4=(-2)^{" + level + "}";
        let getInfo = (level) => "\\sqrt{c_4^{4}}=" + getC4(level).pow(2).toString(0);
        c4 = theory.createUpgrade(5, currencyI, new ExponentialCost(5000, Math.log2(9.5)));
        c4.getDescription = (_) => Utils.getMath(getDesc(c4.level));
        c4.getInfo = (amount) => Utils.getMathTo(getInfo(c4.level), getInfo(c4.level + amount));
    }

    /////////////////////
    // Permanent Upgrades
    theory.createPublicationUpgrade(0, currencyR, 1e6);
    theory.createBuyAllUpgrade(1, currencyR, 1e10);
    theory.createAutoBuyerUpgrade(2, currencyR, 0);
    {
        sellc1 = theory.createPermanentUpgrade(3, currencyI, new FreeCost);
        sellc1.getDescription = (level) => "Decrease c1 level by 1 (" + (sellc1.level > 0 ? (sellc1.level.toString() + "/ 10") : ("No refund")) + ")";
        sellc1.getInfo = (_) => "Reduces c1 level by 1 to swap from real to imaginary";
        sellc1.bought = (_) => {if (sellc1.level > 9){sellc1.level = 0; c1.level = c1.level >= 1 ? c1.level - 1 : 0}; sellC1Timer = 0}
    }

    ///////////////////////
    //// Milestone Upgrades
    theory.setMilestoneCost(new LinearCost(25/4, 25/4));

    {
        a1Exp = theory.createMilestoneUpgrade(0, 2);
        a1Exp.description = Localization.getUpgradeIncCustomExpDesc("a_1", "0.1");
        a1Exp.info = Localization.getUpgradeIncCustomExpInfo("a_1", "0.1");
        a1Exp.boughtOrRefunded = (_) => theory.invalidatePrimaryEquation();
    }

    {
        a2Exp = theory.createMilestoneUpgrade(1, 2);
        a2Exp.description = Localization.getUpgradeIncCustomExpDesc("a_2", "0.1");
        a2Exp.info = Localization.getUpgradeIncCustomExpInfo("a_2", "0.1");
        a2Exp.boughtOrRefunded = (_) => theory.invalidatePrimaryEquation();
    }

    /////////////////
    //// Achievements
    achievement1 = theory.createAchievement(0, "Not quite exponential", "Get 10 tau", () => currencyR.value > BigNumber.TEN.pow(BigNumber.from(10)));
    achievement2 = theory.createAchievement(1, "Getting there", "Get 1e5 tau", () => currencyR.value > BigNumber.TEN.pow(BigNumber.from(50)));
    achievement3 = theory.createAchievement(2, "Real gains", "Get 1e10 tau", () => currencyR.value > BigNumber.TEN.pow(BigNumber.from(100))); 
    achievement4 = theory.createAchievement(3, "VentiMochaLatte", "Get 1e20 tau", () => currencyR.value > BigNumber.TEN.pow(BigNumber.from(200))); 
    achievement5 = theory.createAchievement(4, "Imaginary Limits", "Get 1e50 tau", () => currencyR.value > BigNumber.TEN.pow(BigNumber.from(500))); 
    achievement6 = theory.createAchievement(5, "Exponential", "Get 1e75 tau", () => currencyR.value > BigNumber.TEN.pow(BigNumber.from(750))); 

    ///////////////////
    //// Story chapters
    //chapter1 = theory.createStoryChapter(0, "My First Chapter",
    //    "This is line 1,\n" + 
    //    "and this is line 2.",
    //() => a1.level > 0);
    //chapter2 = theory.createStoryChapter(1, "My Second Chapter", "This is line 1 again,\nand this is line 2... again.\n\nNice again.", () => c2.level > 0);

    updateAvailability();
}

var updateAvailability = () => {
    
}

var tick = (elapsedTime, multiplier) => {

    dt = BigNumber.from(elapsedTime * multiplier);
    sellC1Timer += dt
    if (sellC1Timer > 10) {
        sellC1Timer = -100000
        sellc1.level = 0
    }
    bonus = theory.publicationMultiplier;
    rhodotR = 0;
    rhodotI = 0;

    if (c1.level % 2 == 1){
        rhodotR += getA1(a1.level).pow(getA1Exponent(a1Exp.level)) * getC2(c2.level);
        rhodotI += getA2(a2.level).pow(getA2Exponent(a2Exp.level)) * getC1(c1.level).sqrt();
    } else {
        rhodotR += getA1(a1.level).pow(getA1Exponent(a1Exp.level)) * (getC1(c1.level).sqrt() + getC2(c2.level));
    }

    if (c3.level % 2 == 1) {
        rhodotI += getA2(a2.level).pow(getA2Exponent(a2Exp.level)) * getC3(c3.level).pow(BigNumber.THREE).sqrt();
        rhodotR += getA1(a1.level).pow(getA1Exponent(a1Exp.level)) * getC4(c4.level).pow(BigNumber.TWO);
    } else {
        rhodotR += getA1(a1.level).pow(getA1Exponent(a1Exp.level)) * (getC3(c3.level).pow(BigNumber.THREE).sqrt() + getC4(c4.level).pow(BigNumber.TWO));
    }

    currencyR.value += dt * bonus * rhodotR;
    currencyI.value += dt * bonus * rhodotI;

    theory.invalidateTertiaryEquation();
}

var postPublish = () =>
{
    pubTime = 0;
    theory.invalidatePrimaryEquation();
    theory.invalidateSecondaryEquation();
    theory.invalidateTertiaryEquation();
    theory.invalidateQuaternaryValues();
    updateAvailability();
}

var setInternalState = (stateStr) =>
{
    if(!stateStr)
        return;

    let state = JSON.parse(stateStr);
    if('pubTime' in state)
        pubTime = state.pubTime;

    theory.invalidatePrimaryEquation();
    theory.invalidateTertiaryEquation();
}

var getPrimaryEquation = () => {
    let rhoPart = "\\dot{\\rho} = ";

    rhoPart += "\\sum_{n=1}^{4}\\sqrt{c_n^n}";
    otherPart = "\\rho_1 = a_1" + (a1Exp.level > 0 ? ("^{" + getA1Exponent(a1Exp.level).toString() + "}") : "") + "Re(\\rho), \\rho_2 = a_2 "+ (a2Exp.level > 0 ? ("^{" + getA2Exponent(a2Exp.level).toString() + "}") : "") + " Im(\\rho)"
    
    theory.primaryEquationHeight = 90;
    return `\\begin{array}{c}${rhoPart}\\\\${otherPart}\\end{array}`;

}

var getSecondaryEquation = () => theory.latexSymbol + "=\\max\\rho^{0.4}";
var getTertiaryEquation = () => "\\dot{\\rho_1} = " + bonus * rhodotR + ',\\dot{\\rho_2} = ' + bonus * rhodotI;
var getPublicationMultiplier = (tau) => tau.pow(0.375);
var getPublicationMultiplierFormula = (symbol) => "{" + symbol + "}^{0.375}";
var getTau = () => currencyR.value.pow(BigNumber.ONE / BigNumber.FOUR);
var get2DGraphValue = () => currencyR.value.sign * (BigNumber.ONE + currencyR.value.abs()).log10().toNumber();
var getCurrencyFromTau  = (tau) => [tau.pow(4), currencyR.symbol]

var getA1 = (level) => Utils.getStepwisePowerSum(level, 2, 10, 0);
var getA2 = (level) => Utils.getStepwisePowerSum(level, 2, 10, 0);
var getC1 = (level) => BigNumber.TWO.pow(level)
var getC2 = (level) => BigNumber.TWO.pow(level)
var getC3 = (level) => BigNumber.TWO.pow(level)
var getC4 = (level) => BigNumber.TWO.pow(level)
var getA1Exponent = (level) => BigNumber.from(1 + 0.1 * level);
var getA2Exponent = (level) => BigNumber.from(1 + 0.1 * level);

init();