import { useEffect, useState } from 'react'
import {
  X, Folder, Tag, Layers, AlertTriangle,
  PenTool, Wrench, Factory, Truck, ShoppingCart,
  Hash, FileText, FileCheck2, Receipt, MapPin
} from 'lucide-react'
import { getTheme, formatDate, formatCur } from '../utils/formatadores.js'
import ArvoreHierarquia from './ArvoreHierarquia.jsx'

export default function ModalDetalhes({ card, onClose }) {
  const [activeTab, setActiveTab] = useState('All')

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  if (!card) return null

  const oT = getTheme(card.overallStatus)
  const { Icon: StatusIcon } = oT

  const rPerc = card.riscoFornecedor.saturacaoPerc * 100
  const satClass = rPerc > 80 ? 'badge-sat-red' : (rPerc > 50 ? 'badge-sat-yellow' : 'badge-sat-green')

  const isFiltered = activeTab !== 'All'
  const showEng = !isFiltered || activeTab === 'EngMecanica' || activeTab === 'EngControls'
  const showConst = !isFiltered || activeTab === 'Constructives'
  const showMfg = !isFiltered || activeTab === 'Manufacturing'
  const showFinLog = !isFiltered || activeTab === 'Delivery' || activeTab === 'Commercial'
  const showPurch = !isFiltered || activeTab === 'Purchasing' || activeTab === 'Commercial'

  return (
    <div className="modal-overlay active" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-content">

        <div className="modal-header">
          <div className="modal-header-info">
            <span className="card-tag">{card.cliente} | {card.linhaOp}</span>
            <h2 className="modal-title">{card.id}</h2>
            <p className="card-desc" style={{ marginBottom: '0.5rem' }}>{card.descricao}</p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge-outline"><Folder className="icon-sm" /> {card.projetoWBS}</span>
              <span className="badge-outline"><Tag className="icon-sm" /> Rev: {card.construtivo?.rev ?? '-'}</span>
              <span className="badge-outline"><Layers className="icon-sm" /> {card.construtivo?.makeBuy ?? 'N/A'}</span>
              {card.construtivo?.prioridade && (
                <span className="badge-outline priority-high">
                  <AlertTriangle className="icon-sm" /> Prioridade: {card.construtivo.prioridade}
                </span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
            <button className="modal-close" onClick={onClose}><X className="icon-md" /></button>
            <div className={`card-status-badge ${oT.bg}`}>
              {StatusIcon && <StatusIcon className="icon-sm" />}
              Status Global: {oT.t}
            </div>
          </div>
        </div>

        <div className="modal-body">
          <ArvoreHierarquia 
            stages={card.stages} 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />

          <div className="details-grid">
            {showEng && (
              <div className={`detail-section ${isFiltered ? 'full-width' : ''}`}>
                <h4><PenTool className="icon-sm text-purple" /> Engenharias</h4>
                {(card.pcp || card.construtivo) ? (
                  <div style={{ display: 'grid', gridTemplateColumns: isFiltered ? '1fr 1fr' : '1fr', gap: isFiltered ? '2rem' : '0' }}>
                    <div>
                      <div style={{fontSize: '0.65rem', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '0.5rem', marginTop: '0.2rem'}}>
                        MECÂNICA
                      </div>
                      <InfoRow label="Desenho 3D" value={card.construtivo?.des3D ?? 'Pendente'} badge />
                      <InfoRow label="Desenho 2D" value={card.construtivo?.des2D ?? 'Pendente'} badge />
                      <InfoRow label="Estratégia" value={card.construtivo?.makeBuy ?? '-'} />
                      <InfoRow label="Revisão" value={card.construtivo?.rev ?? '-'} />
                      <InfoRow label="Horas Estimadas" value={`${card.construtivo?.horasPlanejadas ?? '0'} h`} />
                    </div>
                    <div>
                      <div style={{fontSize: '0.65rem', fontWeight: 'bold', color: 'var(--text-muted)', margin: isFiltered ? '0.2rem 0 0.5rem' : '1rem 0 0.5rem', borderTop: isFiltered ? 'none' : '1px dashed var(--border)', paddingTop: isFiltered ? '0' : '0.75rem'}}>
                        CONTROLS
                      </div>
                      <InfoRow label="Projeto Elétrico" value={card.pcp?.projEle ?? 'Não Mapeado'} badge />
                      <InfoRow label="Lista de Materiais" value={card.pcp?.listaMat ?? 'Não Mapeado'} badge />
                      <InfoRow label="Topográfico" value={card.pcp?.projTop ?? 'Não Mapeado'} badge />
                      <InfoRow label="Lista de Identificações" value={card.pcp?.listaIdent ?? 'Não Mapeado'} badge />
                      <InfoRow label="Layout de Calha" value={card.pcp?.layoutCalha ?? 'Não Mapeado'} badge />
                    </div>
                  </div>
                ) : (
                  <p className="text-slate text-sm">Sem dados de Engenharia.</p>
                )}
              </div>
            )}

            {showConst && (
              <div className={`detail-section ${isFiltered ? 'full-width' : ''}`}>
                <h4><Wrench className="icon-sm text-blue" /> Construtivo Ext.</h4>
                {card.construtivo ? (
                  <>
                    <InfoRow label="Fornecedor" value={card.construtivo.fornecedor} />
                    <InfoRow
                      label="Risco / Saturação"
                      value={`${rPerc.toFixed(1)}% | Nota: ${card.riscoFornecedor.nota}`}
                      badgeClass={satClass}
                    />
                    <InfoRow label="Resp. Follow-Up" value={card.construtivo.respFollow} />
                    <InfoRow
                      label="Início / Entrega Orig."
                      value={`${formatDate(card.construtivo.inicio)} / ${formatDate(card.construtivo.entregaForn)}`}
                    />
                    <InfoRow
                      label="Reprogramação"
                      value={formatDate(card.construtivo.reprog)}
                      className="text-red"
                    />
                    <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: 'var(--surface-3)', border: '1px dashed var(--border-mid)', borderRadius: '0.5rem', fontSize: '0.75rem' }}>
                      <strong>Obs. Histórico:</strong>{' '}
                      <span className="text-slate">{card.construtivo.obs || 'S/ observações.'}</span>
                    </div>
                  </>
                ) : (
                  <p className="text-slate text-sm">Sem dados de fornecimento externo.</p>
                )}
              </div>
            )}

            {showMfg && (
              <div className={`detail-section ${isFiltered ? 'full-width' : ''}`}>
                <h4><Factory className="icon-sm text-orange" /> Bordo de Máquina (PCP)</h4>
                {card.pcp ? (
                  <>
                    <InfoRow label="Local Montagem" value={card.construtivo?.localEnt ?? '-'} className="text-indigo" />
                    <InfoRow
                      label="Mat. Elétrico / Pneu"
                      value={`${(parseFloat(card.pcp.matEle) * 100).toFixed(0)}% / ${(parseFloat(card.pcp.matPneu) * 100).toFixed(0)}%`}
                    />
                    <InfoRow label="Miscelâneas / Placa" value={`${card.pcp.misc} / ${card.pcp.placaAlum}`} />
                    <InfoRow label="Etiquetas / QR Code" value={`${card.pcp.etiQ} / ${card.pcp.qrCode}`} />
                    <InfoRow label="Status Testes" value={card.pcp.testes} className="text-orange" />
                  </>
                ) : card.construtivo ? (
                  <>
                    <InfoRow label="Local Montagem" value={card.construtivo?.localEnt ?? '-'} className="text-indigo" />
                    <p className="text-slate" style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>Aguardando entrada física no PCP.</p>
                  </>
                ) : (
                  <p className="text-slate text-sm">Transmissão não listada no Bordo de Máquina.</p>
                )}
              </div>
            )}

            {showFinLog && (
              <div className={`detail-section ${isFiltered ? 'full-width' : ''}`}>
                <h4><Truck className="icon-sm text-green" /> Finanças & Logística</h4>
                {(card.construtivo || card.logisticaAdvanced.cc) ? (
                  <>
                    <InfoRow label="Comprador" value={card.construtivo?.comercialResp ?? '-'} />
                    <InfoRow label="Centro Custo (WBS)" value={card.logisticaAdvanced.cc || card.projetoWBS} />
                    <InfoRow label="Valor Total Ordem" value={formatCur(card.construtivo?.valorTot)} className="text-green" />
                    <InfoRow label="NF Construtivo" value={card.construtivo?.nf ?? '-'} />
                    <InfoRow label="Frete (Incoterm)" value={card.logisticaAdvanced.frete || 'FOB'} />
                    <InfoRow label="Data Presença Carga" value={formatDate(card.logisticaAdvanced.presencaCarga)} className="text-blue" />
                  </>
                ) : (
                  <p className="text-slate text-sm">Sem info. financeira/PRPO.</p>
                )}
              </div>
            )}

            {/* SEÇÃO DE COMPRAS COM REQUISIÇÕES, PEDIDOS E BOM */}
            {showPurch && (
              <div className="detail-section full-width">
                <h4><ShoppingCart className="icon-sm text-yellow" /> Compras & Suprimentos</h4>
                
                {card.construtivo && (
                  <div style={{ display: 'grid', gridTemplateColumns: isFiltered ? '1fr 1fr' : '1fr 1fr', gap: '2rem', marginBottom: '1.25rem' }}>
                    <div>
                      <div style={{fontSize: '0.65rem', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '0.5rem', marginTop: '0.2rem'}}>
                        REQUISIÇÃO DE COMPRA (RC)
                      </div>
                      <InfoRow label="Número da RC" value={card.construtivo?.rc ?? 'Pendente'} badge />
                      <InfoRow label="Data de Emissão (RC)" value={formatDate(card.construtivo?.dtRc)} />
                      <InfoRow label="Data de Necessidade" value={formatDate(card.construtivo?.dtNecessidade)} className="text-yellow" />
                    </div>
                    <div>
                      <div style={{fontSize: '0.65rem', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '0.5rem', marginTop: '0.2rem'}}>
                        PEDIDO DE COMPRA (PC / OC)
                      </div>
                      <InfoRow label="Número do Pedido" value={card.construtivo?.oc ?? 'Pendente'} badge />
                      <InfoRow label="Data de Emissão (PC)" value={formatDate(card.construtivo?.dtOc)} />
                      <InfoRow label="Previsão de Entrega" value={formatDate(card.construtivo?.entregaForn)} className="text-blue" />
                    </div>
                  </div>
                )}

                <div style={{fontSize: '0.65rem', fontWeight: 'bold', color: 'var(--text-muted)', margin: '0 0 0.5rem', borderTop: '1px dashed var(--border-mid)', paddingTop: '0.75rem'}}>
                  LISTA DE MATERIAIS (BOM) - ITENS COMERCIAIS
                </div>

                {card.comerciais.length > 0 ? (
                  <div className="items-list">
                    {card.comerciais.map((c, i) => (
                      <div key={i} className="item-row">
                        <div className="item-title">{c.desc}</div>
                        <div className="item-meta">
                          <span style={{ background: 'var(--surface-3)', border: 'none', fontWeight: 600 }}>
                            <Tag className="icon-inline" /> {c.pn}
                          </span>
                          <span><Hash className="icon-inline" /> Qtd: {c.qtd}</span>
                          <span><FileText className="icon-inline" /> RC: {c.rc || 'Pend.'}</span>
                          <span className={!c.oc ? 'text-red' : 'text-green'}>
                            <FileCheck2 className="icon-inline" /> OC: {c.oc || 'Pend.'}
                          </span>
                          {c.nf && (
                            <span className="text-green">
                              <Receipt className="icon-inline" /> NF: {c.nf}
                            </span>
                          )}
                          {c.pull && (
                            <span className="text-indigo">
                              <MapPin className="icon-inline" /> PULL: {c.pull}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate text-sm">Nenhum item BOM associado a este processo.</p>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value, badge = false, badgeClass = '', className = '' }) {
  return (
    <div className="info-row">
      <span className={`info-label ${className}`}>{label}:</span>
      <span className={`info-val ${badge || badgeClass ? 'badge-status' : ''} ${badgeClass} ${className}`}>
        {value}
      </span>
    </div>
  )
}