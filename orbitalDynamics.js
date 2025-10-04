import { BigNumber } from '../api/BigNumber';
import { ExponentialCost, FreeCost } from '../api/Costs';
import { theory } from '../api/Theory';
import { Utils } from '../api/Utils';
import { CompositeCost, CustomCost, FirstFreeCost } from './api/Costs';
import { Theory } from './api/Theory';

var id = 'orbital_mechanics';
var name = 'Orbital Mechanics';
var description = 'The one and only.';
var authors = 'Eylanding';

let currency;

let P;
let q = BigNumber.ONE;
const g = 6.67e-11;

let m1 = 1e30;
let m2 = 1e24;

let init = () =>
{
    currency = theory.createCurrency();
    {
        c1 = theory.createUpgrade(0, currency, new FirstFreeCost(ExponentialCost(5e17, 0.5)));
        let getDesc = (level) => `c_1 = ${getC1(level).toString()}`;
        c1.getDescription = (amount) => Utils.getMath(getDesc(c1.level));
        let getInfo = (level) => `c_1 = ${getC1(level).toString()}`;
        c1.getInfo = (amount) => Utils.getMathTo(getInfo(c1.level), getInfo(c1.level + amount));
    }
    {
        c2 = theory.createUpgrade(1, currency, new ExponentialCost(1e21, 1/0.3));
        let getDesc = (level) => `c_2 = 2^{${level.toString()}}`;
        c2.getDescription = (amount) => Utils.getMath(getDesc(c2.level));
        let getInfo = (level) => `c_2 = ${getC2(level).toString()}`;
        c2.getInfo = (amount) => Utils.getMathTo(getInfo(c2.level), getInfo(c2.level + amount));
    }
    {
        q1 = theory.createUpgrade(2, currency, new FirstFreeCost(ExponentialCost(5e17, 0.5)));
        let getDesc = (level) => `q_1 = ${getQ1(level).toString()}`;
        q1.getDescription = (amount) => Utils.getMath(getDesc(q1.level));
        let getInfo = (level) => `q_1 = ${getQ1(level).toString()}`;
        q1.getInfo = (amount) => Utils.getMathTo(getInfo(q1.level), getInfo(q1.level + amount));
    }
    {
        q2 = theory.createUpgrade(3, currency, new ExponentialCost(1e21, 1/0.25));
        let getDesc = (level) => `q_2 = 2^{${level.toString()}}`;
        q2.getDescription = (amount) => Utils.getMath(getDesc(q2.level));
        let getInfo = (level) => `q_2 = ${getQ2(level).toString()}`;
        q2.getInfo = (amount) => Utils.getMathTo(getInfo(q2.level), getInfo(q2.level + amount));
    }

    theory.createPublicationUpgrade(0, currency, BigNumber.from('1e25'));
    theory.createBuyAllUpgrade(1, currency, BigNumber.from('1e2'));
    theory.createAutoBuyerUpgrade(2, currency, BigNumber.from('1e3'));

    {
        eccentricity = theory.createPermanentUpgrade(3, currency, new CustomCost((level) => {
            if (level == 0) return BigNumber.from("1e50");
            if (level == 1) return BigNumber.from("1e100");
            if (level == 2) return BigNumber.from("1e200");
            if (level == 3) return BigNumber.from("1e400");
            if (level == 4) return BigNumber.from("1e500");
            return BigNumber.from(-1);
        }));
        eccentricity.getDescription = (amount) => "Increase eccentricity";
        eccentricity.getInfo = (amount) => "$\\uparrow$ starting velocity by 10\\%. Resets planet";
        eccentricity.boughtOrRefunded = (_) => {
            starting_velocity = Math.sqrt(m1 * g / 1.5e11) * 1.1**eccentricity.level;
            P = {x:1.5e11,y:0,vx:0,vy:starting_velocity};
        };
        eccentricity.maxLevel = 5;

    }

    const milestoneCost = new CustomCost((level) =>
        {
            if(level == 0) return BigNumber.from(40);
            if(level == 1) return BigNumber.from(75);
            if(level == 2) return BigNumber.from(125);
            if(level == 3) return BigNumber.from(150);
            if(level == 4) return BigNumber.from(175);
            if(level == 5) return BigNumber.from(225);
            if(level == 6) return BigNumber.from(250);
            if(level == 7) return BigNumber.from(275);
            if(level == 8) return BigNumber.from(300);
            if(level == 9) return BigNumber.from(350);
            return BigNumber.from(-1);
        });
    
    theory.setMilestoneCost(milestoneCost);
    {
        c1exp = theory.createMilestoneUpgrade(1, 5);
        c1exp.description = Localization.getUpgradeIncCustomExpDesc("c_1", "0.05");
        c1exp.info = Localization.getUpgradeIncCustomExpInfo("c_1", "0.1");
        c1exp.boughtOrRefunded = (_) => {theory.invalidatePrimaryEquation();}
    }
    {
        q1exp = theory.createMilestoneUpgrade(2, 5);
        q1exp.description = Localization.getUpgradeIncCustomExpDesc("q_1", "0.05");
        q1exp.info = Localization.getUpgradeIncCustomExpInfo("q_1", "0.1");
        q1exp.boughtOrRefunded = (_) => {theory.invalidateSecondaryEquation();}
    }

    starting_velocity = Math.sqrt(m1 * g / 1.5e11) * 1.1**eccentricity.level;
    P = {x:1.5e11,y:0,vx:0,vy:starting_velocity};
}

var tick = (elapsedTime, multiplier) =>
{
    let dt = BigNumber.from(elapsedTime * multiplier);
    let bonus = theory.publicationMultiplier;
    let r = (P.x ** 2 + P.y ** 2) ** 0.5;
    let v = (P.vx ** 2 + P.vy ** 2) ** 0.5;
    let qdot = getQ1(q1.level) * getQ2(q2.level) * r;
    q += qdot * dt;
    let rhodot = getC1(c1.level) * getC2(c2.level) * q * v;
    currency.value += dt * bonus * rhodot;
    let accel = g*m1/(r**2);
    let direction = [-(P.x)/r, -(P.y)/r];
    P.vx += accel * direction[0] * dt * 3e6;
    P.vy += accel * direction[1] * dt * 3e6;
    P.x += P.vx * dt * 3e6;
    P.y += P.vy * dt * 3e6;
    theory.invalidateTertiaryEquation();
}

var getInternalState = () => JSON.stringify
({
    q: q.toBase64String()
});

var setInternalState = (stateStr) =>
{
    if(!stateStr)
        return;

    let state = JSON.parse(stateStr);
    q = BigNumber.fromBase64String(state.q) ?? q;
}

var getPublicationMultiplier = (tau) => tau.pow(0.1);
var getPublicationMultiplierFormula = (symbol) => `{${symbol}}^{${0.1}}`;
var getTau = () => currency.value;
var getCurrencyFromTau = (tau) =>
[
    tau.max(BigNumber.ONE),
    currency.symbol
];

var getPrimaryEquation = () => `\\dot{\\rho} = c_1${c1exp.level ? `^{${1+c1exp.level * 0.05}}` : ""}c_2q|v_P|`;
var getSecondaryEquation = () => `\\tau = \\max(\\rho), \\dot{q} = q_1${q1exp.level ? `^{${1+q1exp.level * 0.05}}` : ""}q_2|r_P|`
var getTertiaryEquation = () => `r_P = [${P.x}, ${P.y}], q = ${q}`
var get2DGraphValue = () => currency.value.sign * (BigNumber.ONE + currency.value.abs()).log10().toNumber();
let getC2 = (level) => BigNumber.TWO.pow(level)
let getC1 = (level) => Utils.getStepwisePowerSum(level, 2, 10, 0);
let getQ2 = (level) => BigNumber.TWO.pow(level)
let getQ1 = (level) => Utils.getStepwisePowerSum(level, 2, 10, 0);

init();