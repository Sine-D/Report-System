/*##################################################################################################################################################
####################################################################################################################################################
################################################################    KAVIJA DULMITH    ##############################################################
################################################################       02/09/2025     ##############################################################
####################################################################################################################################################
####################################################################################################################################################*/

import { queryDatabase } from '../../../db';

/*
    This is the code which return the item code then 
    customer doesnt have to type it specially by it 
    We can avoid mistakes
*/


export async function GET() {

    try {

        const qry = `
            SELECT 
                RIGHT(MAX([SysID]), LEN(MAX([SysID])) - 3) AS MAX_NUMBER
            FROM [cspMaster].[dbo].[ITEM_MST];
        `;
        const result = await queryDatabase(qry);
        const itemNumber = (result[0]?.MAX_NUMBER) 
            ? (parseInt(result[0].MAX_NUMBER) + 1).toString().padStart(5, "0")
            : "00001";
        console.log('itemNumber before padding:', itemNumber);
        return new Response(JSON.stringify("ITM"+itemNumber), {status: 200});

    } catch (err) {

        return new Response(JSON.stringify({error : err.message}), {status: 500});
    }
}