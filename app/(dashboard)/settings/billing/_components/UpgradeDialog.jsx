"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function UpgradeDialog({ open, onClose, onConfirm, currentQuantity, newQuantity, newPrice }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upgrade your plan now</DialogTitle>
          <DialogDescription>
            You're currently on a plan of <strong>{currentQuantity}</strong> comments/month.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 bg-violet-50 rounded-lg p-4 text-sm font-medium text-violet-700">
          <div>New plan</div>
          <div className="text-lg font-semibold text-violet-900 mt-1">{newQuantity} comments / month</div>
        </div>

        <div className="mt-6 space-y-2 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>What you’ll pay monthly</span>
            <span className="text-foreground font-semibold">${newPrice.toFixed(2)}</span>
          </div>
          <div className="text-xs">Starting now, next billing will follow your usual renewal date.</div>
        </div>

        <div className="mt-4 text-sm">
          You will receive <strong>{newQuantity}</strong> credits now. These credits will be added to the remaining ones you currently have.
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onConfirm} className="bg-[#1870EC] hover:bg-[#0a5ac7] text-white">
            Confirm & Pay
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
