I009_TEMPLATE_WRAPPER = """
<shipmentReceiptsInCollection xmlns="http://www.usmc.mil/schemas/1/if/stratis">
    {}
</shipmentReceiptsInCollection>
"""

I009_TEMPLATE_MREC = """
<mRec>
    <spoolID>{doc.id}</spoolID>      
    <iPAAC>{doc.aac}</iPAAC>      
    <dIC>{status.dic}</dIC>      
    <sCN></sCN>      
    <pIN></pIN>      
    <sID></sID>      
    <rCN></rCN>      
    <rIC></rIC>      
    <sDN>{doc.sdn}</sDN>      
    <sfx></sfx>      
    <nIIN>{doc.part.niin}</nIIN>      
    <uOI>{doc.part.uom}</uOI>      
    <qM></qM>      
    <qCCA>{status.received_qty}</qCCA>      
    <qCCF>0</qCCF>      
    <recSDN></recSDN>      
    <status></status>      
    <fCC></fCC>      
    <fund></fund>      
    <keyD>{status.gcss_txn_date}</keyD>      
    <jON></jON>
    <rON></rON>      
    <pri></pri>      
    <proj></proj>      
    <rDD></rDD>      
    <sC></sC>      
    <supADD></supADD>      
    <mOfShip></mOfShip>      
    <tCN></tCN>      
    <txnDate>{status.gcss_txn_date}</txnDate>      
    <cFlag></cFlag>      
    <demC></demC>    
</mRec>  
"""
