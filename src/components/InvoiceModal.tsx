import React from 'react';
import { X, Printer, Download, CheckCircle2, ShieldCheck } from 'lucide-react';
import { OrderLink } from '../types';
import { INITIAL_BUSINESS } from '../data/initialData';

interface InvoiceModalProps {
  order: OrderLink;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  const taxableAmount = Math.round(order.amount / 1.05);
  const gstAmount = order.amount - taxableAmount;
  const cgst = Math.round(gstAmount / 2);
  const sgst = gstAmount - cgst;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden print:p-0 print:shadow-none print:max-w-full">
        {/* Top Controls Bar (hidden during print) */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-100 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Official GST Tax Invoice & Delivery Receipt</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
              aria-label="Close invoice"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Body */}
        <div className="p-8 space-y-6 text-sm">
          {/* Invoice Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{INITIAL_BUSINESS.name}</h2>
              <div className="text-xs text-slate-600 mt-1 leading-relaxed">
                <div>Handloom & Artisanal Cooperative</div>
                <div>GSTIN: {INITIAL_BUSINESS.gstin}</div>
                <div>{INITIAL_BUSINESS.city}</div>
                <div>VPA: {INITIAL_BUSINESS.vpa}</div>
              </div>
            </div>

            <div className="text-right space-y-1">
              <span className="inline-block px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-mono text-xs font-bold uppercase tracking-wider">
                TAX INVOICE
              </span>
              <div className="text-xs text-slate-500 font-mono mt-1">Invoice #: INV-{order.linkCode}</div>
              <div className="text-xs text-slate-500">Date: {order.createdAt}</div>
              <div className="text-xs font-semibold text-emerald-700">Status: {order.status.toUpperCase()}</div>
            </div>
          </div>

          {/* Bill To & Ship To */}
          <div className="grid grid-cols-2 gap-6 text-xs border-b border-slate-200 pb-6">
            <div>
              <div className="font-bold text-slate-500 uppercase tracking-wider mb-1">Billed & Shipped To:</div>
              <div className="font-bold text-slate-900 text-sm">{order.customerName}</div>
              <div className="text-slate-600">{order.customerPhone || 'Contact phone on file'}</div>
              <div className="text-slate-500 mt-1">Place of Supply: Karnataka (State Code 29)</div>
            </div>

            <div>
              <div className="font-bold text-slate-500 uppercase tracking-wider mb-1">Payment Reference:</div>
              {order.paymentMethod ? (
                <div className="space-y-0.5">
                  <div className="font-semibold text-slate-800">{order.paymentMethod.name}</div>
                  <div className="font-mono text-slate-600">Ref: {order.paymentMethod.ref}</div>
                  <div className="text-slate-500">Paid at: {order.paymentMethod.paidAt}</div>
                </div>
              ) : (
                <div className="text-amber-700 font-semibold">Payment Pending via Reachr SmartPay Link</div>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-300 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-2">Item Description</th>
                <th className="py-2 text-center">HSN</th>
                <th className="py-2 text-center">Qty</th>
                <th className="py-2 text-right">Taxable (₹)</th>
                <th className="py-2 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 font-medium text-slate-900">
                  {order.note}
                  <div className="text-[11px] text-slate-500">{order.terms}</div>
                </td>
                <td className="py-3 text-center text-slate-600 font-mono">5208</td>
                <td className="py-3 text-center font-mono">{order.quantity}</td>
                <td className="py-3 text-right font-mono">₹{taxableAmount.toLocaleString('en-IN')}</td>
                <td className="py-3 text-right font-bold text-slate-900 font-mono">
                  ₹{taxableAmount.toLocaleString('en-IN')}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Totals Summary */}
          <div className="flex justify-end pt-2">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Taxable Value:</span>
                <span className="font-mono">₹{taxableAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>CGST (2.5%):</span>
                <span className="font-mono">₹{cgst.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>SGST (2.5%):</span>
                <span className="font-mono">₹{sgst.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between border-t border-slate-300 pt-2 font-bold text-sm text-slate-900">
                <span>Invoice Total:</span>
                <span className="font-mono text-base">₹{order.amount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Digital Signature & Footer Declaration */}
          <div className="border-t border-slate-200 pt-6 flex justify-between items-end text-xs text-slate-500">
            <div className="max-w-xs leading-relaxed text-[11px]">
              This is a computer-generated tax invoice verified under the Reachr Dispute & Settlement Protocol.
              Subject to Bengaluru jurisdiction.
            </div>
            <div className="text-right">
              <div className="w-32 h-10 border-b border-dashed border-slate-400 mb-1 ml-auto flex items-center justify-center text-[10px] text-indigo-700 font-mono">
                [DIGITALLY SIGNED]
              </div>
              <div className="font-semibold text-slate-700">Authorized Signatory</div>
              <div className="text-[10px] text-slate-500">{INITIAL_BUSINESS.name}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
