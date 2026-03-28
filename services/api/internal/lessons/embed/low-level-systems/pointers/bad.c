#include <stdio.h>

int main(void) {
    int x = 10;
    int *p = &x;

    /* Bug: %d expects an int, but p is a pointer (an address).
       You wanted the value *at* x, which is *p — not p itself. */
    printf("value at x: %d\n", p);

    return 0;
}
