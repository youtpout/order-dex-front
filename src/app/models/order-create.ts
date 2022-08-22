export interface IOrderCreate {
    tokenToBuy: string;
    amountToBuy: number;
    tokenToSell: string;
    amountToSell: number;
    toETH: boolean;
}