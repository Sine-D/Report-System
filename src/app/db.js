/*##################################################################################################################################################
####################################################################################################################################################
################################################################    KAVIJA DULMITH    ##############################################################
################################################################          &           ##############################################################
################################################################    SINETH DINSARA    ##############################################################
################################################################       16/08/2025     ##############################################################
####################################################################################################################################################
####################################################################################################################################################*/

// src/app/db.js
import sql from 'mssql';

const config = {
  user: process.env.USER,
  password: process.env.PASSWORD,
  server: process.env.SERVER,
  database: process.env.DATABASE,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

export async function connectToDB() {
  try {
    const pool = await sql.connect(config);
    return pool;
  } catch (err) {
    console.error('Connection error:', err);
    throw err;
  }
}

// for running plain SQL queries
export async function queryDatabase(query) {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(query);
    return result.recordset || [];
  } catch (err) {
    console.error('SQL error', err);
    return [];
  }
}

// Initialize database tables for invoicing system
export async function initInvoicingTables() {
  try {
    const pool = await sql.connect(config);
    
    // Create USER_MST table
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='USER_MST' AND xtype='U')
      CREATE TABLE USER_MST (
        UserID VARCHAR(8) NOT NULL PRIMARY KEY,
        SlpID TEXT,
        LoginName TEXT NOT NULL,
        LoginPWD TEXT,
        ActiveStat INTEGER,
        UserGroup TEXT,
        TrnYes INTEGER,
        BillPriceRes INTEGER,
        DefPriceCate TEXT,
        HideOrNot INTEGER
      );
    `);

    // Create CUSTOMER_MST table
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='CUSTOMER_MST' AND xtype='U')
      CREATE TABLE CUSTOMER_MST(
        LocID TEXT NOT NULL,
        SysID TEXT NOT NULL PRIMARY KEY,
        CusName TEXT,
        CusCode TEXT,
        ConPer TEXT,
        PostCode TEXT,
        AddLin1 TEXT,
        AddLin2 TEXT,
        AddLin3 TEXT,
        CityName TEXT,
        ConMobi TEXT,
        ConTele TEXT,
        FaxNo TEXT,
        EmailAdd TEXT,
        WebAdd TEXT,
        WarMess TEXT,
        StopTrn INTEGER,
        StopDate TEXT,
        StopReson TEXT,
        CusGrpCode TEXT,
        Cate1Code TEXT,
        Cate2Code TEXT,
        Cate3Code TEXT,
        NicNo TEXT,
        PasPort TEXT,
        VatNo TEXT,
        CusPoint REAL,
        CrediAllow INTEGER,
        CredAmt REAL,
        TrnStarDate TEXT,
        DefCus INTEGER,
        CusSex TEXT,
        CusDofBirth TEXT,
        Commission TEXT,
        TrnYes INTEGER,
        BirthYes INTEGER,
        BirthDay TEXT,
        BirthDayRmk TEXT,
        SpecialDayYes INTEGER,
        SpecialDay TEXT,
        SpecialDayRmk TEXT,
        Interest TEXT,
        SpecialRmk TEXT,
        AnaDayYes INTEGER,
        AnaDate TEXT,
        AnaRmk TEXT,
        CusTitle TEXT,
        CusFirstName TEXT,
        CusMidName TEXT,
        MaleFeemale TEXT,
        CusLstName TEXT,
        SVatNo TEXT,
        CusDeliAdd1 TEXT,
        CusDeliAdd2 TEXT,
        SlpCode TEXT,
        ServCharge INTEGER,
        DiscountAlow INTEGER,
        CusBarcode TEXT,
        YearOfReg INTEGER,
        CusIndex INTEGER,
        CusSinName TEXT,
        LoyaltyCus INTEGER,
        PriceCategory TEXT,
        MasterCusCode TEXT,
        CreditFlowNeed INTEGER
      );
    `);

    // Create ITEM_MST table
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ITEM_MST' AND xtype='U')
      CREATE TABLE ITEM_MST (
        LocID TEXT NOT NULL,
        SysID TEXT NOT NULL PRIMARY KEY,
        ItemName TEXT,
        ItemCode TEXT,
        ItemGroup TEXT,
        ItemSubGroup TEXT,
        ItemDiscription TEXT,
        RetailPrice REAL,
        PurchasedPrice REAL,
        AvlQty REAL,
        ReseQty REAL,
        OrderedQty REAL,
        EstQty REAL,
        MaxStoreQty REAL,
        ReOrderQty REAL,
        DefaSupCode TEXT,
        ItemTypeCode TEXT,
        UnitTypeCode TEXT,
        LocaTypeCode TEXT,
        TaxGrpCode TEXT,
        SalesLedCode TEXT,
        StockLedCode TEXT,
        BatchReq INTEGER,
        SeriReq INTEGER,
        ExpReq INTEGER,
        LifeCycle REAL,
        WarrItem INTEGER,
        WarrMonth REAL,
        WarrDay REAL,
        StockMaintain INTEGER,
        UnitWithDeci INTEGER,
        FreeIssue INTEGER,
        AppirOnList INTEGER,
        PurchaItem INTEGER,
        FormulaItem INTEGER,
        Disconti INTEGER,
        DisconDate TEXT,
        DisconReason TEXT,
        AccumuPriceYes INTEGER,
        AdditionFee REAL,
        FirstItemOnly INTEGER,
        ForEachItem INTEGER,
        LooseSelingItem INTEGER,
        LoosePrice REAL,
        UnitType TEXT,
        Capacity REAL,
        PackItem INTEGER,
        PackQty REAL,
        MoreDiscrip TEXT,
        Remarks TEXT,
        SinhalaName TEXT,
        Service INTEGER,
        UserID TEXT,
        LengthByWidth INTEGER,
        PayTerm INTEGER,
        DoRequired INTEGER,
        TrnYes INTEGER,
        SubItemOrNot INTEGER,
        MasterItemCode TEXT,
        RelatedQty REAL,
        LoadingFee REAL,
        GrpSortOrder INTEGER,
        ReturnableItm INTEGER,
        BarCode TEXT,
        ProfitMrg INTEGER,
        PrceUpdNeed INTEGER,
        LstUniPurPrice REAL,
        StockValidate INTEGER,
        InnerPck INTEGER,
        ClusterItem INTEGER,
        Waight REAL,
        ServiceCharge INTEGER,
        CostNotValidate INTEGER,
        ArtiNoRequired INTEGER,
        GiftVouch INTEGER
      );
    `);

    // Create PRICE_TRN table
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='PRICE_TRN' AND xtype='U')
      CREATE TABLE PRICE_TRN(
        LocId TEXT NOT NULL,
        SysId TEXT NOT NULL,
        PriceCate TEXT DEFAULT 'GRP00014',
        ItemCode TEXT NOT NULL,
        EfeDate TEXT DEFAULT (CONVERT(VARCHAR, GETDATE(), 120)),
        PriLevel INTEGER NOT NULL,
        UppCount REAL,
        MarkPrice REAL,
        RetPrice REAL,
        CredPrice REAL,
        DisPrice REAL,
        DisPrecen REAL DEFAULT 0,
        ActivStatus INTEGER DEFAULT 1,
        UserId TEXT DEFAULT 'UID00009',
        EnterDate TEXT DEFAULT (CONVERT(VARCHAR, GETDATE(), 120)),
        PurPrice REAL DEFAULT 0,
        TrnYes INTEGER DEFAULT 0,
        MRP REAL DEFAULT 0
      );
    `);

    // Create INVOICE_HDR table
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='INVOICE_HDR' AND xtype='U')
      CREATE TABLE INVOICE_HDR (
        LocID TEXT NOT NULL,
        CSID INTEGER,
        TerInvNO TEXT NOT NULL,
        RefNO TEXT,
        SlpCode TEXT,
        Staff TEXT,
        CreditOrCash INTEGER,
        InvDate DATETIME,        
        InvTime DATETIME,        
        CusCode TEXT,
        CusPoint INTEGER,
        NoOfItems INTEGER,
        ItemDis REAL,
        SubTot REAL,
        InvoDis REAL,
        TaxAmount REAL,
        NetAmount REAL,
        CashPaidAmt REAL,
        UserID TEXT,
        SysDateTime DATETIME,
        ViewInvNo TEXT,
        TotalCost REAL,
        TrnYes INTEGER,
        NbtAmt REAL,
        DeliCharge REAL,
        PriceCateType TEXT,
        PriceCategory TEXT
      );  
    `);

    // Add Staff column if it doesn't exist (for existing tables)
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                     WHERE TABLE_NAME = 'INVOICE_HDR' AND COLUMN_NAME = 'Staff')
      BEGIN
        ALTER TABLE INVOICE_HDR ADD Staff TEXT;
      END
    `);

    // Create INVOICE_DTL table
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='INVOICE_DTL' AND xtype='U')
      CREATE TABLE INVOICE_DTL (
        LocID TEXT NOT NULL,
        TerInvID TEXT NOT NULL,
        InvLineNO INTEGER NOT NULL,
        ItemCode TEXT NOT NULL,
        RetPrice REAL,
        ItemQty FLOAT,
        UnitPrice REAL,
        DiscAmt REAL,
        TaxAmt REAL,
        NetAmt REAL,
        ItemCost REAL,
        InventLocID TEXT,
        BagQty REAL,
        IRF INTEGER,
        TrnYes INTEGER,
        SpeciDtl TEXT,
        ItemDis TEXT,
        DisPrecen REAL,
        MarkedPrice REAL,
        ItmIsueTime DATETIME
      );
    `);

    // Create INVOICE_TER_INVO_ID table
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='INVOICE_TER_INVO_ID' AND xtype='U')
      CREATE TABLE INVOICE_TER_INVO_ID (
        TerInvNO TEXT NOT NULL
      );
    `);

    // Create DELETED_INVOICE_HDR table
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='DELETED_INVOICE_HDR' AND xtype='U')
      CREATE TABLE DELETED_INVOICE_HDR (
        LocID TEXT NOT NULL,
        TerInvNO TEXT NOT NULL,
        RefNO TEXT,
        SlpCode TEXT,
        CreditOrCash INTEGER,
        InvDate TEXT,        
        InvTime TEXT,        
        CusCode TEXT,
        CusPoint INTEGER,
        NoOfItems INTEGER,
        ItemDis REAL,
        SubTot REAL,
        InvoDis REAL,
        TaxAmount REAL,
        NetAmount REAL,
        CashPaidAmt REAL,
        UserID TEXT,
        SysDateTime TEXT,
        ViewInvNo TEXT,
        TotalCost REAL,
        TrnYes INTEGER,
        NbtAmt REAL,
        DeliCharge REAL,
        PriceCateType TEXT,
        PriceCategory TEXT
      );  
    `);

    // Create DELETED_INVOICE_DTL table
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='DELETED_INVOICE_DTL' AND xtype='U')
      CREATE TABLE DELETED_INVOICE_DTL (
        LocID TEXT NOT NULL,
        TerInvID TEXT NOT NULL,
        InvLineNO INTEGER NOT NULL,
        ItemCode TEXT NOT NULL,
        RetPrice REAL,
        ItemQty REAL,
        UnitPrice REAL,
        DiscAmt REAL,
        TaxAmt REAL,
        NetAmt REAL,
        ItemCost REAL,
        InventLocID TEXT,
        BagQty REAL,
        IRF INTEGER,
        TrnYes INTEGER,
        SpeciDtl TEXT,
        ItemDis TEXT,
        DisPrecen REAL,
        MarkedPrice REAL,
        ItmIsueTime TEXT
      );
    `);

    // Create TERMINAL_CONFIG table
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='TERMINAL_CONFIG' AND xtype='U')
      CREATE TABLE TERMINAL_CONFIG (
        LocID TEXT DEFAULT 'LOC00001',
        TerID TEXT,
        EndPointURL TEXT
      );
    `);

    // Create LOGGED_USER table
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='LOGGED_USER' AND xtype='U')
      CREATE TABLE LOGGED_USER (
        UserID TEXT NULL
      );
    `);

    console.log("Invoicing tables initialized successfully");
    return true;
  } catch (err) {
    console.error('Error initializing invoicing tables:', err);
    throw err;
  }
}

// Generate next TerInvID by reading latest ID from database
export async function getNextTerInvID(locId = 'POS00001') {
  try {
    const pool = await sql.connect(config);
    
    // Get the latest TerInvID from INVOICE_DTL table
    const latestIdQuery = `
      SELECT TOP 1 TerInvID 
      FROM [cspMaster].[dbo].[INVOICE_DTL] 
      WHERE LocID = @LocID 
      ORDER BY TerInvID DESC
    `;
    
    const result = await pool.request()
      .input('LocID', sql.VarChar(8), locId)
      .query(latestIdQuery);
    
    let nextId = '00000001'; // Default starting ID
    
    if (result.recordset && result.recordset.length > 0) {
      const latestId = result.recordset[0].TerInvID;
      if (latestId && latestId.length === 8) {
        // Extract numeric part and increment
        const numericPart = parseInt(latestId);
        if (!isNaN(numericPart)) {
          const nextNumeric = numericPart + 1;
          nextId = nextNumeric.toString().padStart(8, '0');
        }
      }
    }
    
    return nextId;
  } catch (err) {
    console.error('Error generating next TerInvID:', err);
    // Fallback to timestamp-based generation if database read fails
    const now = new Date();
    const y = now.getFullYear().toString().slice(-2);
    const m = (now.getMonth() + 1).toString().padStart(2, '0');
    const d = now.getDate().toString().padStart(2, '0');
    const hh = now.getHours().toString().padStart(2, '0');
    const mm = now.getMinutes().toString().padStart(2, '0');
    const ss = now.getSeconds().toString().padStart(2, '0');
    return `${y}${m}${d}${hh}${mm}${ss}`.slice(0, 8);
  }
}

// Store next TerInvID in INVOICE_TER_INVO_ID table for tracking
export async function storeNextTerInvID(terInvId, locId = 'POS00001') {
  try {
    const pool = await sql.connect(config);
    
    // Insert or update the next TerInvID in the tracking table
    const insertQuery = `
      IF EXISTS (SELECT 1 FROM [cspMaster].[dbo].[INVOICE_TER_INVO_ID] WHERE TerInvNO = @TerInvID)
        UPDATE [cspMaster].[dbo].[INVOICE_TER_INVO_ID] 
        SET TerInvNO = @TerInvID
        WHERE TerInvNO = @TerInvID
      ELSE
        INSERT INTO [cspMaster].[dbo].[INVOICE_TER_INVO_ID] (TerInvNO) VALUES (@TerInvID)
    `;
    
    await pool.request()
      .input('TerInvID', sql.VarChar(8), terInvId)
      .query(insertQuery);
      
    return true;
  } catch (err) {
    console.error('Error storing next TerInvID:', err);
    return false;
  }
}

// Get current TerInvID sequence status for debugging
export async function getTerInvIDStatus(locId = 'POS00001') {
  try {
    const pool = await sql.connect(config);
    
    // Get latest TerInvID from INVOICE_DTL
    const latestDtlQuery = `
      SELECT TOP 1 TerInvID 
      FROM [cspMaster].[dbo].[INVOICE_DTL] 
      WHERE LocID = @LocID 
      ORDER BY TerInvID DESC
    `;
    
    // Get stored next TerInvID from tracking table
    const trackingQuery = `
      SELECT TOP 1 TerInvNO 
      FROM [cspMaster].[dbo].[INVOICE_TER_INVO_ID] 
      ORDER BY TerInvNO DESC
    `;
    
    const [latestDtl, tracking] = await Promise.all([
      pool.request().input('LocID', sql.VarChar(8), locId).query(latestDtlQuery),
      pool.request().query(trackingQuery)
    ]);
    
    return {
      latestInDtl: latestDtl.recordset?.[0]?.TerInvID || 'None',
      nextInTracking: tracking.recordset?.[0]?.TerInvNO || 'None',
      nextGenerated: await getNextTerInvID(locId)
    };
  } catch (err) {
    console.error('Error getting TerInvID status:', err);
    return {
      latestInDtl: 'Error',
      nextInTracking: 'Error',
      nextGenerated: 'Error'
    };
  }
}

export { sql };

