import { ExponentialCost, FreeCost, LinearCost } from "./api/Costs";
import { Localization } from "./api/Localization";
import { BigNumber } from "./api/BigNumber";
import { theory } from "./api/Theory";
import { Utils } from "./api/Utils";

var id = "sqrt_of_minus_one";
var name = "The square root of -1";
var description =
("Work with complex numbers to boost the theory.\n" +
"Balance increacing rho1 and 2 to maximise gains\n\n" +
"WIP: 240 / 1500 rho | MS phase complete\n" +
"Version 1.1.1");
var authors = "Eylanding";
var version = 1;

var currencyR, currencyI;
var a1, a2, c1, c2, c3, c4;
var c1boost, a1Exp, a2Exp;
const a12expTable = [1, 1.1, 1.15];
var q;

var achievement1, achievement2, achievement3, achievement4, achievement5, achievement6, achievement7, achievement8, achievement9;
var chapter1, chapter2;

var sellC1Timer = 0;

var rhodotR, rhodotI, dt, bonus;

var init = () => {
    currencyR = theory.createCurrency("ρᵣ", "\\rho_r");
    currencyI = theory.createCurrency("ρᵢ", "\\rho_i");

    ///////////////////
    // Regular Upgrades

    // a1
    {
        let getDesc = (level) => "a_1=" + getA1(level) + "";
        let getInfo = (level) => "a_1=" + getA1(level).toString(0);
        a1 = theory.createUpgrade(0, currencyI, new FirstFreeCost(new ExponentialCost(10, Math.log2(1.26))));
        a1.getDescription = (_) => Utils.getMath(getDesc(a1.level));
        a1.getInfo = (amount) => Utils.getMathTo(getInfo(a1.level), getInfo(a1.level + amount));
        a1.maxLevel = 2000
    }

    // a2
    {
        let getDesc = (level) => "a_2=" + getA2(level) + "";
        let getInfo = (level) => "a_2=" + getA2(level).toString(0);
        a2 = theory.createUpgrade(1, currencyR, new FirstFreeCost(new ExponentialCost(10**10, Math.log2(1.48))));
        a2.getDescription = (_) => Utils.getMath(getDesc(a2.level));
        a2.getInfo = (amount) => Utils.getMathTo(getInfo(a2.level), getInfo(a2.level + amount));
    }

    // c1
    {
        let getDesc = (level) => "c_1="+ (c1buff.level >= 1 ? "200\\times" : "") +"(-2)^{" + level + "}";
        let getInfo = (level) => "\\sqrt{c_1}=" + getC1(level).pow(0.5).toString(0) + ((level % 2 == 1) ? 'i' : '');
        c1 = theory.createUpgrade(2, currencyR, new ExponentialCost(10, Math.log2(1.95)));
        c1.getDescription = (_) => Utils.getMath(getDesc(c1.level));
        c1.getInfo = (amount) => Utils.getMathTo(getInfo(c1.level), getInfo(c1.level + amount));
    }

    // c2
    {
        let getDesc = (level) => "c_2=(-2)^{" + level + "}";
        let getInfo = (level) => "\\sqrt{c_2^{2}}=" + getC2(level).toString(0);
        c2 = theory.createUpgrade(3, currencyI, new ExponentialCost(5, Math.log2(3.2)));
        c2.getDescription = (_) => Utils.getMath(getDesc(c2.level));
        c2.getInfo = (amount) => Utils.getMathTo(getInfo(c2.level), getInfo(c2.level + amount));
    }

    // c3
    {
        let getDesc = (level) => "c_3=(-2)^{" + level + "}";
        let getInfo = (level) => "\\sqrt{c_3^{3}}=" + getC3(level).pow(1.5).toString(0) + ((level % 2 == 1) ? 'i' : '');
        c3 = theory.createUpgrade(4, currencyR, new ExponentialCost(5000, Math.log2(7.1)));
        c3.getDescription = (_) => Utils.getMath(getDesc(c3.level));
        c3.getInfo = (amount) => Utils.getMathTo(getInfo(c3.level), getInfo(c3.level + amount));
    }

    // c4
    {
        let getDesc = (level) => "c_4=(-2)^{" + level + "}";
        let getInfo = (level) => "\\sqrt{c_4^{4}}=" + getC4(level).pow(2).toString(0);
        c4 = theory.createUpgrade(5, currencyI, new ExponentialCost(10**6, Math.log2(9.5)));
        c4.getDescription = (_) => Utils.getMath(getDesc(c4.level));
        c4.getInfo = (amount) => Utils.getMathTo(getInfo(c4.level), getInfo(c4.level + amount));
    }

    /////////////////////
    // Permanent Upgrades
    theory.createPublicationUpgrade(0, currencyR, 5e6);
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

    const milestoneCost = new CustomCost((level) =>
        {
            if(level == 0) return BigNumber.from(30 * 0.4);
            if(level == 1) return BigNumber.from(50 * 0.4);
            if(level == 2) return BigNumber.from(70 * 0.4);
            if(level == 3) return BigNumber.from(100 * 0.4);
            if(level == 4) return BigNumber.from(200 * 0.4);
            if(level == 5) return BigNumber.from(230 * 0.4);
            return BigNumber.from(-1);
        });

    theory.setMilestoneCost(milestoneCost);

    {
        c1buff = theory.createMilestoneUpgrade(0, 1);
        c1buff.description = "Improve $c_1$ variable power"
        c1buff.info = "Improve $c_1$ variable power";
        c1buff.boughtOrRefunded = (_) => updateAvailability();
        c1buff.canBeRefunded = () => (a1Exp.level == 0 && a2Exp.level == 0)
    }

    {
        a1Exp = theory.createMilestoneUpgrade(1, 2);
        a1Exp.getDescription = (amount) => Localization.getUpgradeIncCustomExpDesc("a_1", Math.round((a12expTable[a1Exp.level + amount] - a12expTable[a1Exp.level] || 0) * 100) / 100);
        a1Exp.getInfo = (amount) => Localization.getUpgradeIncCustomExpInfo("a_1", Math.round((a12expTable[a1Exp.level + amount] - a12expTable[a1Exp.level] || 0) * 100) / 100);
        a1Exp.boughtOrRefunded = (_) => theory.invalidatePrimaryEquation();
    }

    {
        a2Exp = theory.createMilestoneUpgrade(2, 2);
        a2Exp.getDescription = (amount) => Localization.getUpgradeIncCustomExpDesc("a_2", Math.round((a12expTable[a2Exp.level + amount] - a12expTable[a2Exp.level] || 0) * 100) / 100);
        a2Exp.getInfo = (amount) => Localization.getUpgradeIncCustomExpInfo("a_2", Math.round((a12expTable[a2Exp.level + amount] - a12expTable[a2Exp.level] || 0) * 100) / 100);
        a2Exp.boughtOrRefunded = (_) => theory.invalidatePrimaryEquation();
    }

    /////////////////
    //// Achievements
    achievement1 = theory.createAchievement(0, "Publishing papers", "Unlock Publications", () => theory.isPublicationAvailable);
    achievement2 = theory.createAchievement(1, "Imaginary power", "Buy a second level of a₂", () => a2.level > 1);
    achievement3 = theory.createAchievement(2, "An important milestone", "Unlock your first milestone (1e30)", () => currencyR.value > 1e30); 
    achievement4 = theory.createAchievement(3, "VentiMochaLatte", "Get 1e20 tau", () => currencyR.value > 1e50); 
    achievement5 = theory.createAchievement(4, "Super swaps", "Unlock your third milestone (1e70)", () => currencyR.value > 1e70); 
    achievement6 = theory.createAchievement(5, "Exponential", "Unlock your forth milestone (1e100)", () => currencyR.value > 1e100); 
    achievement7 = theory.createAchievement(6, "Idle at last", "Unlock your fifth milestone (1e200)", () => currencyR.value > 1e200); 
    achievement8 = theory.createAchievement(7, "Variable Hell", "Cap a₁", () => a1.level >= 2000); 
    achievement9 = theory.createAchievement(8, "pini", "Reach the end of the theories content (1e240)", () => currencyR.value > 1e240); 

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
    a1Exp.isAvailable = c1buff.level >= 1
    a2Exp.isAvailable = c1buff.level >= 1
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
    otherPart = "\\rho_r = a_1" + (a1Exp.level > 0 ? ("^{" + getA1Exponent(a1Exp.level).toString() + "}") : "") + "Re(\\rho), \\rho_i = a_2 "+ (a2Exp.level > 0 ? ("^{" + getA2Exponent(a2Exp.level).toString() + "}") : "") + " Im(\\rho)"
    
    theory.primaryEquationHeight = 90;
    return `\\begin{array}{c}${rhoPart}\\\\${otherPart}\\end{array}`;

}

var getSecondaryEquation = () => theory.latexSymbol + "=\\max\\rho^{0.4}";
var getTertiaryEquation = () => "\\dot{\\rho_r} = " + bonus * rhodotR + ',\\dot{\\rho_i} = ' + bonus * rhodotI;
var getPublicationMultiplier = (tau) => tau.pow(0.4);
var getPublicationMultiplierFormula = (symbol) => "{" + symbol + "}^{0.4}";
var getTau = () => currencyR.value.pow(0.4);
var get2DGraphValue = () => currencyR.value.sign * (BigNumber.ONE + currencyR.value.abs()).log10().toNumber();
var getCurrencyFromTau  = (tau) => [tau.pow(1/0.4), currencyR.symbol]

var getA1 = (level) => Utils.getStepwisePowerSum(level, 2, 10, 0);
var getA2 = (level) => Utils.getStepwisePowerSum(level, 2, 10, 0);
var getC1 = (level) => BigNumber.TWO.pow(level) * (c1buff.level >= 1 ? 200 : 1)
var getC2 = (level) => BigNumber.TWO.pow(level)
var getC3 = (level) => BigNumber.TWO.pow(level)
var getC4 = (level) => BigNumber.TWO.pow(level)
var getA1Exponent = (level) => BigNumber.from(a12expTable[level]);
var getA2Exponent = (level) => BigNumber.from(a12expTable[level]);

init();