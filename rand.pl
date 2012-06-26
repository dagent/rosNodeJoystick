#! /usr/bin/perl

chomp ($prog = `basename $0`);
$RANGE = 10;
$PERIOD = 1.0;

sub usage () {
$out = <<DUH

    $prog [RANGE [PERIOD]]

    Output to STDOUT a random *integer* between 0 and RANGE-1 every PERIOD
    seconds.  RANGE defaults to $RANGE, and PERIOD to $PERIOD.

DUH
;
print STDERR $out;
exit;
}

if ( $ARGV[0] =~ /\-h/ ) {
    usage();
}

if ( $ARGV[0] =~ /(\d|.)+/ ) {
    $RANGE = $ARGV[0];
}
if ( $ARGV[1] =~ /(\d)+/ ) {
    $PERIOD = $ARGV[1];
}

$| = 1;
while (1) {
    $rand = int(rand($RANGE));
    print "$rand\n";
# This is a sleep
    select(undef, undef, undef, $PERIOD);
}


